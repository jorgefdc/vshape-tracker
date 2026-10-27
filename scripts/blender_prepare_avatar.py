"""Prepare a humanoid GLB with named proportional shape keys using Blender 4.x.
Run headless: blender -b --python scripts/blender_prepare_avatar.py -- input.glb output.glb
This is an illustrative starting point; a character artist should sculpt and validate the targets.
"""
import bpy
import math
import os
import sys

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if len(argv) != 2:
    raise SystemExit("Usage: blender -b --python scripts/blender_prepare_avatar.py -- input.glb output.glb")
source, target = map(os.path.abspath, argv)
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=source)

meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
if not meshes:
    raise SystemExit("Input has no mesh objects")

fields = {
    "shoulder_width": (.80, .11, .47),
    "chest_size": (.67, .14, .45),
    "waist_size": (.49, .11, .43),
    "hip_width": (.39, .12, .42),
    "arm_size": (.62, .24, .33),
    "thigh_size": (.28, .13, .24),
    "calf_size": (.12, .095, .22),
}

from mathutils import Vector
all_world = [obj.matrix_world @ vert.co for obj in meshes for vert in obj.data.vertices]
minimum = min(v.y for v in all_world)
maximum = max(v.y for v in all_world)
height = max(maximum - minimum, 1e-5)
middle = (min(v.x for v in all_world) + max(v.x for v in all_world)) / 2
width = max(max(v.x for v in all_world) - min(v.x for v in all_world), 1e-5)

for obj in meshes:
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    if obj.data.shape_keys is None:
        obj.shape_key_add(name="Basis", from_mix=False)
    basis = obj.data.shape_keys.key_blocks["Basis"]
    for key, (center_y, radius_y, strength) in fields.items():
        for direction, sign in (("larger", 1), ("smaller", -1)):
            name = f"{key}_{direction}"
            shape = obj.shape_key_add(name=name, from_mix=False)
            for index, vertex in enumerate(obj.data.vertices):
                world = obj.matrix_world @ basis.data[index].co
                y = (world.y - minimum) / height
                vertical = math.exp(-((y - center_y) / radius_y) ** 2)
                lateral = abs(world.x - middle) / (width * 0.5)
                arm_zone = min(1, max(0, (lateral - .63) * 3))
                zone = arm_zone if key == "arm_size" else 1 - arm_zone
                if key in ("thigh_size", "calf_size"):
                    zone = 1
                intensity = sign * .22 * strength * vertical * zone
                world.x = middle + (world.x - middle) * (1 + intensity)
                world.z *= 1 + intensity * .70
                local = obj.matrix_world.inverted() @ world
                shape.data[index].co = local
            shape.value = 0
    obj.select_set(False)

os.makedirs(os.path.dirname(target), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=target, export_format="GLB", export_morph=True,
                          export_skins=True, export_animations=False)
print("Exported:", target)
