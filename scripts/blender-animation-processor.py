#!/usr/bin/env python3

"""
Blender Animation Processor
Processes Blender animation files and exports them with proper naming schemes
"""

import os
import sys
import json
import argparse
import subprocess
from pathlib import Path
from typing import List, Dict, Optional

# Blender script template for processing animations
BLENDER_SCRIPT_TEMPLATE = """
import bpy
import os
import json
from pathlib import Path

def process_animation_file(filepath, output_dir, naming_scheme='artist'):
    \"\"\"Process a single Blender file and export animations\"\"\"

    # Clear existing scene
    bpy.ops.wm.read_factory_settings(use_empty=True)

    # Open the file
    bpy.ops.wm.open_mainfile(filepath=filepath)

    results = {
        'file': filepath,
        'animations': [],
        'errors': []
    }

    try:
        # Get all objects with animation data
        animated_objects = [obj for obj in bpy.data.objects if obj.animation_data and obj.animation_data.action]

        if not animated_objects:
            results['errors'].append('No animated objects found')
            return results

        for obj in animated_objects:
            if obj.animation_data and obj.animation_data.action:
                action = obj.animation_data.action

                # Extract animation info
                anim_info = {
                    'object': obj.name,
                    'action': action.name,
                    'frame_start': int(action.frame_range[0]),
                    'frame_end': int(action.frame_range[1]),
                    'duration': action.frame_range[1] - action.frame_range[0]
                }

                # Convert to proper naming scheme
                new_name = convert_animation_name(action.name, naming_scheme)
                anim_info['converted_name'] = new_name

                # Export the animation (GLTF format)
                output_file = Path(output_dir) / f"{new_name}.gltf"

                # Select only this object
                bpy.ops.object.select_all(action='DESELECT')
                obj.select_set(True)
                bpy.context.view_layer.objects.active = obj

                # Export GLTF with animation
                bpy.ops.export_scene.gltf(
                    filepath=str(output_file),
                    export_selected=True,
                    export_animations=True,
                    export_animation_mode='ACTIONS',
                    export_nla_strips=False,
                    export_frame_range=True,
                    export_frame_step=1,
                    export_custom_properties=True
                )

                anim_info['exported_file'] = str(output_file)
                results['animations'].append(anim_info)

                print(f"Exported animation: {action.name} -> {new_name}")

    except Exception as e:
        results['errors'].append(str(e))
        print(f"Error processing {filepath}: {e}")

    return results

def convert_animation_name(blender_name, target_scheme='artist'):
    \"\"\"Convert Blender animation name to target naming scheme\"\"\"

    # Basic name cleaning
    name = blender_name.strip().replace(' ', '_')

    # Remove common Blender prefixes/suffixes
    name = name.replace('Action', '').replace('action', '')
    name = name.replace('.001', '').replace('.000', '')

    if target_scheme == 'artist':
        # Convert to Owen_PascalCase format
        parts = name.split('_')
        pascal_parts = [part.capitalize() for part in parts if part]
        return f"Owen_{''.join(pascal_parts)}"

    elif target_scheme == 'legacy':
        # Convert to lowercase_with_underscores_L
        name_lower = name.lower()
        # Add suffix based on animation type (default to L for Loop)
        if not name_lower.endswith(('_l', '_s')):
            name_lower += '_l'
        return name_lower

    elif target_scheme == 'hierarchical':
        # Convert to owen.category.subcategory
        parts = name.lower().split('_')
        return f"owen.state.{'.'.join(parts)}.loop"

    elif target_scheme == 'semantic':
        # Convert to OwenPascalCase
        parts = name.split('_')
        pascal_parts = [part.capitalize() for part in parts if part]
        return f"Owen{''.join(pascal_parts)}Loop"

    return name

# Main processing
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 4:
        print("Usage: blender --background --python script.py input_dir output_dir naming_scheme")
        sys.exit(1)

    input_dir = sys.argv[-3]
    output_dir = sys.argv[-2]
    naming_scheme = sys.argv[-1]

    print(f"Processing animations from {input_dir} to {output_dir} with {naming_scheme} scheme")

    # Create output directory
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    # Process all .blend files in input directory
    blend_files = list(Path(input_dir).glob('*.blend'))

    all_results = {
        'processed_files': [],
        'total_animations': 0,
        'total_files': len(blend_files),
        'naming_scheme': naming_scheme
    }

    for blend_file in blend_files:
        print(f"Processing: {blend_file}")
        result = process_animation_file(str(blend_file), output_dir, naming_scheme)
        all_results['processed_files'].append(result)
        all_results['total_animations'] += len(result['animations'])

    # Save processing report
    report_file = Path(output_dir) / 'processing_report.json'
    with open(report_file, 'w') as f:
        json.dump(all_results, f, indent=2)

    print(f"Processing complete. Processed {all_results['total_animations']} animations from {all_results['total_files']} files.")
    print(f"Report saved to: {report_file}")
"""

def main():
    parser = argparse.ArgumentParser(description='Process Blender animation files')
    parser.add_argument('--input-dir', required=True, help='Directory containing .blend files')
    parser.add_argument('--output-dir', required=True, help='Directory to export processed animations')
    parser.add_argument('--naming-scheme', default='artist', choices=['legacy', 'artist', 'hierarchical', 'semantic'],
                       help='Target naming scheme for animations')
    parser.add_argument('--blender-path', default='blender', help='Path to Blender executable')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be processed without actually doing it')

    args = parser.parse_args()

    # Validate input directory
    input_path = Path(args.input_dir)
    if not input_path.exists():
        print(f"Error: Input directory '{args.input_dir}' does not exist")
        sys.exit(1)

    # Find .blend files
    blend_files = list(input_path.glob('*.blend'))
    if not blend_files:
        print(f"Warning: No .blend files found in '{args.input_dir}'")
        return

    print(f"Found {len(blend_files)} .blend files to process:")
    for blend_file in blend_files:
        print(f"  • {blend_file.name}")

    if args.dry_run:
        print(f"\nDry run complete. Would process {len(blend_files)} files with {args.naming_scheme} scheme.")
        return

    # Create output directory
    output_path = Path(args.output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Create temporary Blender script
    script_path = output_path / 'temp_blender_script.py'
    with open(script_path, 'w') as f:
        f.write(BLENDER_SCRIPT_TEMPLATE)

    try:
        # Run Blender with the script
        print(f"\nProcessing animations with Blender...")
        print(f"Input: {args.input_dir}")
        print(f"Output: {args.output_dir}")
        print(f"Scheme: {args.naming_scheme}")

        cmd = [
            args.blender_path,
            '--background',
            '--python', str(script_path),
            '--',
            args.input_dir,
            args.output_dir,
            args.naming_scheme
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode == 0:
            print("✅ Blender processing completed successfully!")
            print(result.stdout)
        else:
            print("❌ Blender processing failed!")
            print("STDOUT:", result.stdout)
            print("STDERR:", result.stderr)
            sys.exit(1)

        # Load and display the processing report
        report_file = output_path / 'processing_report.json'
        if report_file.exists():
            with open(report_file, 'r') as f:
                report = json.load(f)

            print(f"\n📊 Processing Summary:")
            print(f"Files processed: {report['total_files']}")
            print(f"Animations exported: {report['total_animations']}")
            print(f"Naming scheme: {report['naming_scheme']}")

            # Show any errors
            errors = []
            for file_result in report['processed_files']:
                errors.extend(file_result.get('errors', []))

            if errors:
                print(f"\n⚠️  Errors encountered:")
                for error in errors:
                    print(f"  • {error}")

    finally:
        # Clean up temporary script
        if script_path.exists():
            script_path.unlink()

if __name__ == '__main__':
    main()
