import { PinataSDK } from "pinata-web3";

export const PINATA_GATEWAY = "https://fuchsia-far-impala-831.mypinata.cloud";

// For client-side uploads, we'll use edge functions with the JWT
// This is just for gateway URL access
export const getPinataGatewayUrl = (hash: string) => {
  return `${PINATA_GATEWAY}/ipfs/${hash}`;
};

export const getPinataClient = (jwt: string) => {
  return new PinataSDK({
    pinataJwt: jwt,
    pinataGateway: PINATA_GATEWAY,
  });
};
