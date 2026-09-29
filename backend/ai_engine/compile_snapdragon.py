import qai_hub as hub


MODEL_ID = "mq9y8py4n"


print("SnapGuard X Qualcomm AI Hub deployment")
print("--------------------------------------")


# --------------------------------------------------
# Get uploaded model
# --------------------------------------------------

print("\nRetrieving uploaded model...")

model = hub.get_model(MODEL_ID)

print("Model retrieved successfully.")

print("Model ID:")
print(model.model_id)

print("Model name:")
print(model.name)


# --------------------------------------------------
# Get Snapdragon X Elite device
# --------------------------------------------------

print("\nFinding Snapdragon X Elite target...")

devices = hub.get_devices(
    name="Snapdragon X Elite CRD",
    os="11"
)

if not devices:
    raise RuntimeError(
        "Snapdragon X Elite CRD Windows 11 device "
        "was not found."
    )

device = devices[0]


print("\nTarget device:")
print(device)

print("\nDevice attributes:")

for attribute in device.attributes:
    print(" -", attribute)


# --------------------------------------------------
# Submit compilation
# --------------------------------------------------

print("\nSubmitting compilation job...")

compile_job = hub.submit_compile_job(
    model=model,
    device=device,
    name="SnapGuard X - Snapdragon X Elite"
)


print("\nCompilation job submitted successfully.")

print("Job ID:")
print(compile_job.job_id)

print("\nJob status:")
print(compile_job.status)


# --------------------------------------------------
# Wait for compilation
# --------------------------------------------------

print("\nWaiting for Qualcomm AI Hub compilation...")

compile_job.wait()


# --------------------------------------------------
# Final status
# --------------------------------------------------

print("\n======================================")
print("COMPILATION RESULT")
print("======================================")

print("Status:")
print(compile_job.status)

print("\nJob:")
print(compile_job)


# --------------------------------------------------
# Download compiled model if successful
# --------------------------------------------------

if str(compile_job.status).upper() in [
    "SUCCESS",
    "COMPLETED"
]:

    output_path = (
        "ai_engine/model/"
        "snapguard_xelite_compiled.onnx"
    )

    print("\nDownloading compiled model...")

    compile_job.download_target_model(
        output_path
    )

    print("\nCompiled model saved to:")
    print(output_path)

else:

    print(
        "\nCompilation did not complete successfully."
    )

    print(
        "Check the Qualcomm AI Hub job details above."
    )