async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const SneakDogToken = await ethers.getContractFactory("SneakDogToken");
  const token = await SneakDogToken.deploy();
  await token.deployed();

  console.log("SneakDogToken deployed to:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
