import Image from "next/image";

export default function ProductTile({product}) {
    const {price = 0, productName = '', productId = '', image: {link = '', imageAlt = ''} = {}, } = product;
  return (
    <>
    <a key={productId} href={productId} className="group">
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
                <img
                  src={link}
                  alt={imageAlt}
                  className="h-full w-full object-cover object-center group-hover:opacity-75"
                />
              </div>
              <h3 className="mt-4 text-sm text-gray-700">{productName}</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">{price}</p>
            </a>
    </>
  );
}
