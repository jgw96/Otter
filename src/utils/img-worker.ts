import { decodeBlurHash } from 'fast-blurhash';

// @ts-ignore
const canvas = new OffscreenCanvas(1, 1);
const ctx: any = canvas.getContext("2d");

self.onmessage = (e) => {
    const { hash, width, height } = e.data;

    canvas.width = width;
    canvas.height = height;

    const pixels = decodeBlurHash(hash, width, height);

    const imageData = (ctx as CanvasRenderingContext2D).createImageData(canvas.width, canvas.height);

    if (pixels) {
        imageData.data.set(pixels);
        ctx!.putImageData(imageData, 0, 0);

        const bitmap = canvas.transferToImageBitmap();

        self.postMessage(bitmap);
    }
    else {
        const bitmap = canvas.transferToImageBitmap();

        self.postMessage(bitmap);
    }

}