fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Compile the proto files located in ./proto/
    tonic_prost_build::compile_protos("../proto-contract/analytics.proto")?;
    println!("cargo:rerun-if-changed=proto/analytics.proto");
    Ok(())
}