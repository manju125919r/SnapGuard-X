import qai_hub as hub

MODEL_ID = "mn0g8jx8m"

print("Retrieving SnapGuard classifier from Qualcomm AI Hub...")
print("-----------------------------------------------------")

model = hub.get_model(MODEL_ID)

print("\nModel:")
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

print("\nSubmitting compilation job...")

compile_job = hub.submit_compile_job(
    model=model,
    device=device,
    name="SnapGuard X - Numeric Classifier - Snapdragon X Elite"
)

print("\nCompilation job submitted successfully!")

print("Job ID:")
print(compile_job.job_id)

print("\nJob:")
print(compile_job)

print("\nIMPORTANT:")
print("Do not submit another compile job.")
print("Use this Job ID to check the compilation result.")