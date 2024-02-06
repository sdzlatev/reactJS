import Image from "next/image";
import ProductTile from "./productTile";
import CryptoJS from 'crypto-js';

function generateRandomString(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function generateCodeChallenge(code_verifier) {
  return CryptoJS.SHA256(code_verifier);
}

function base64URL(string) {
  return string.toString(CryptoJS.enc.Base64).replace(/=/g, '').replace(/\+/g, '-').replace(/\+/g, '_')
}

function generateCodePair() {

  var verifier = base64URL(generateRandomString(96));
  var challenge = base64URL((generateCodeChallenge(verifier)));

  return {
    verifier: verifier,
    challenge: challenge
  }
}

async function Authorize() {
  const codePair = generateCodePair();
  const res = await fetch ('https://kv7kzm78.api.commercecloud.salesforce.com/shopper/auth/v1/organizations/f_ecom_zzrl_059/oauth2/authorize?redirect_uri=http://localhost:3000/callback&response_type=code&client_id=aeef000c-c4c6-4e7e-96db-a98ee36c6292&hint=guest&code_challenge=' + codePair.challenge, {
    redirect: 'manual'
  });
  const location = await res.headers.get('Location').split('?');
  const parameters = location[1].split('&');
  const usid = parameters.pop().substring(5);
  const code = parameters.pop().substring(5);
  
  return {
    usid: code,
    code: usid,
    verifier: codePair.verifier,
    challenge: codePair.challenge
  };
}

async function CreateToken(authorizationData) {
  console.log(authorizationData);
  const body = new URLSearchParams({
    code: authorizationData.code,
    grant_type: 'authorization_code_pkce',
    redirect_uri: 'http://localhost:3000/callback',
    code_verifier: authorizationData.verifier,
    channel_id: 'RefArch',
    client_id: 'aeef000c-c4c6-4e7e-96db-a98ee36c6292',
    usid: authorizationData.usid
   });
  const res = await fetch ('https://kv7kzm78.api.commercecloud.salesforce.com/shopper/auth/v1/organizations/f_ecom_zzrl_059/oauth2/token', {
   headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
   },
   method: 'POST',
   redirect: 'manual',
   body: body.toString()
  });
  var result = await res.json();
  const {access_token} = result;
  return access_token;
}

async function FetchProducts(token) {
  const res = await fetch ('https://kv7kzm78.api.commercecloud.salesforce.com/search/shopper-search/v1/organizations/f_ecom_zzrl_059/product-search?siteId=RefArch&refine=cgid%3Dskirt', {
    headers: {Authorization: 'Bearer ' + token}
  });
  var result = await res.json();
  return await result;
}

async function retrieveProducts () {
  // const cache = retrieveCache();
  const authorizeData = await Authorize();
  const bearerToken = await CreateToken(authorizeData);
  const products = await FetchProducts(bearerToken);
  products.data=authorizeData;

  return await products;
}

export default async function Home() {
  console.log('start');
  const result = await retrieveProducts ();
  const {hits: products = []} = result;
  return (
    <div className="bg-white">
      <p>Hello {products.length} {products.data}</p>
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="sr-only">Products</h2>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <>
           <ProductTile product={product}/>
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
