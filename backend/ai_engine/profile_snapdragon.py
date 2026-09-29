import qai_hub as hub

MODEL_ID = "mn75rxv3m"

print("Retrieving compiled SnapGuard X model...")
print("-----------------------------------------")

model = hub.get_model(MODEL_ID)

print("\nCompiled target model:")
print(model)

print("\nFinding Snapdragon X Elite device...")

devices = hub.get_devices(
    name="Snapdragon X Elite CRD",
    os="11"
)

if not devices:
    raise RuntimeError("Snapdragon X Elite CRD device not found.")

device = devices[0]

print("\nTarget device:")
print(device)

print("\nSubmitting profiling job...")

profile_job = hub.submit_profile_job(
    model=model,
    device=device,
    name="SnapGuard X - Snapdragon X Elite Profiling"
)

print("\nProfiling job submitted successfully!")

print("Job ID:")
print(profile_job.job_id)

print("\nJob:")
print(profile_job)

print("\nDo not submit another compile job.")
print("Use this Job ID to check the profiling result.")