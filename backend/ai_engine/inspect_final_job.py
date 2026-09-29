import qai_hub as hub

JOB_ID = "jp1no1yng"

print("Inspecting successful SnapGuard X compilation...")
print("------------------------------------------------")

job = hub.get_job(JOB_ID)

print("\nJob:")
print(job)

print("\nStatus:")
print(job.get_status())

print("\nAvailable artifacts:")
print(job.get_available_artifacts())

print("\nTarget model:")
try:
    target_model = job.get_target_model()
    print(target_model)
except Exception as e:
    print("Target model not directly available:")
    print(type(e).__name__)
    print(e)

print("\nTarget shapes:")
try:
    print(job.get_target_shapes())
except Exception as e:
    print("Target shapes not available:")
    print(type(e).__name__)
    print(e)