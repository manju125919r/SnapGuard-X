import qai_hub as hub

MODEL_ID = "mn0g8jx8m"

print("Retrieving SnapGuard classifier...")
print("----------------------------------")

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

print("\nSubmitting static-shape compilation...")
print("Input specification: features = float32[1, 277]")

compile_job = hub.submit_compile_job(
    model=model,
    device=device,
    name="SnapGuard X - Static Classifier - Snapdragon X Elite",
    input_specs={
        "features": ((1, 277), "float32")
    }
)

print("\nCompilation job submitted successfully!")

print("Job ID:")
print(compile_job.job_id)

print("\nJob:")
print(compile_job)

print("\nDo not submit another job.")
print("Use this Job ID to check the result.")