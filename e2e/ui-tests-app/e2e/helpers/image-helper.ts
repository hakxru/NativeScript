import { AppiumDriver, UIElement, logError, IRectangle } from "nativescript-dev-appium";
import { ImageOptions } from "nativescript-dev-appium/lib/image-options";
import { assert } from "chai";

export class ImageHelper {
    private _imagesResults = new Map<string, boolean>();
    constructor(private _driver: AppiumDriver) { }

    public async compareScreen(imageName: string, timeOutSeconds?: number, tolerance?: number, toleranceType?: ImageOptions) {
        const result = await this._driver.compareScreen(imageName, timeOutSeconds, tolerance, toleranceType)
        this._imagesResults.set(imageName, result);

        return result;
    }

    public async compareElement(imageName: string, element: UIElement, tolerance: number, timeOutSeconds: number, toleranceType: ImageOptions = ImageOptions.pixel) {
        const result = await this._driver.compareElement(element, imageName, tolerance, timeOutSeconds, toleranceType)
        this._imagesResults.set(imageName, result);

        return result;
    }

    public async compareRectangle(imageName: string, element: IRectangle, tolerance: number, timeOutSeconds: number, toleranceType: ImageOptions = ImageOptions.pixel) {
        const result = await this._driver.compareRectangle(element, imageName, timeOutSeconds, tolerance, toleranceType)
        this._imagesResults.set(imageName, result);

        return result;
    }

    public assertImages() {
        let shouldFailTest = false;
        console.log();
        this._imagesResults.forEach((v, k, map) => {
            if (!this._imagesResults.get(k)) {
                shouldFailTest = true;
                logError(`Image comparisson for image ${k} failed`);
            }
        });

        this.reset();
        assert.isTrue(!shouldFailTest, `Image comparisson failers`)
    }

    public reset() {
        this._imagesResults.clear();
    }
}