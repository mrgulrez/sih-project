async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const DocumentVerification = await ethers.getContractFactory("DocumentVerification");
  const documentVerification = await DocumentVerification.deploy();

  console.log("DocumentVerification contract deployed to:", documentVerification.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
