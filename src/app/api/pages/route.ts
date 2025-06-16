import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as nacl from "tweetnacl";
import * as bs58 from "bs58";
import { DAS } from "helius-sdk";
import { endpoint } from "@/lib/utils";

export const runtime = "nodejs";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");
    const encoding = searchParams.get("encoding");

    if (!address || !encoding) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      ); 
    }

    const isCollecter = await validateWallet(address, encoding);

    if(!isCollecter){
      return NextResponse.json(
        { error: "Not a holder" },
        { status: 403 }
      ); 
    }

    const TOTAL_PAGES = 22;
    const promises = [];
    for (let i = 0; i <= TOTAL_PAGES; i++) {
      const paddedIndex = String(i).padStart(2, '0');
      const key = `gorecats/Gorecats_${paddedIndex}.jpg`;// or .png depending on your format

      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ResponseContentType: "image/jpeg",
      });

      const urlPromise = getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour
      promises.push(urlPromise);
    }

    const urls = await Promise.all(promises);
    return NextResponse.json({ images: urls });
  } catch (err) {
    console.error("Error generating presigned image URLs:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

async function validateWallet(address: string, encoding: string) {
  let dataBytes: Uint8Array;
  let signatures: Uint8Array[];

  try {
    const message = `${process.env.SIGN_MESSAGE}`;

    dataBytes = new TextEncoder().encode(message);
    signatures = [bs58.default.decode(encoding)];
  } catch (e) {
    return false;
  }

  const publicKeyBytes = bs58.default.decode(address);

  const isVerified = verifySignature(dataBytes, signatures, publicKeyBytes);
  if (!isVerified) return false;

  const assets = await getAssetsByGroup("Exm6CUmtkNWvKywrkc7Cm4pYKxeJVjaYjiwVu8chr5R6", 1, 250);
  return isVerified && assets.some((asset) => asset.ownership.owner == address);
}

const getAssetsByGroup = async (
  collection: string,
  page: number,
  limit: number
): Promise<DAS.GetAssetResponse[]> => {
  const params: DAS.AssetsByGroupRequest = {
    groupKey: "collection",
    groupValue: collection,
    page,
    limit,
  };
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "my-id",
      method: "getAssetsByGroup",
      params,
    }),
  });
  const { result } = await response.json();
  return result.items;
};

const verifySignature = (
  messageBytes: Uint8Array,
  signatures: Uint8Array[],
  publicKey: Uint8Array
) => {
  try {
    return signatures.some((signature) => {
      const isSigned = nacl.sign.detached.verify(
        messageBytes,
        signature,
        publicKey
      );

      return isSigned;
    });
  } catch (e) {
    return false;
  }
};
