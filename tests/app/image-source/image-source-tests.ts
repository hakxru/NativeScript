﻿import * as imageSource from "tns-core-modules/image-source";
import * as imageAssetModule from "tns-core-modules/image-asset";
import * as fs from "tns-core-modules/file-system";
import * as app from "tns-core-modules/application";
import * as TKUnit from "../tk-unit";

const imagePath = "~/assets/logo.png";
const splashscreenPath = "~/assets/splashscreen.png";
const splashscreenWidth = 372;
const splashscreenHeight = 218;
const smallImagePath = "~/assets/small-image.png";

export function testFromResource() {
    // >> imagesource-resname
    const img = imageSource.fromResource("icon");
    // << imagesource-resname

    TKUnit.assert(img.height > 0, "image.fromResource failed");
}

export function testFromUrl(done) {
    let result: imageSource.ImageSource;

    // Deprecated method fromUrl
    imageSource.fromUrl("https://www.google.com/images/errors/logo_sm_2.png")
        .then((res: imageSource.ImageSource) => {
            // console.log("Image successfully loaded");
            // completed = true;
            result = res;
            try {
                TKUnit.assertNotEqual(result, undefined, "Image not downloaded");
                TKUnit.assert(result.height > 0, "Image not downloaded");
                done(null);
            }
            catch (e) {
                done(e);
            }
        }, (error) => {
            // console.log("Error loading image: " + error);
            //completed = true;
            done(error);
        });
}

export function testSaveToFile() {
    // >> imagesource-save-to
    const img = imageSource.fromFile(imagePath);
    const folder = fs.knownFolders.documents();
    const path = fs.path.join(folder.path, "test.png");
    const saved = img.saveToFile(path, "png");
    // << imagesource-save-to
    TKUnit.assert(saved, "Image not saved to file");
    TKUnit.assert(fs.File.exists(path), "Image not saved to file");
}

export function testSaveToFile_WithQuality() {
    const img = imageSource.fromFile(imagePath);
    const folder = fs.knownFolders.documents();
    const path = fs.path.join(folder.path, "test.png");
    const saved = img.saveToFile(path, "png", 70);
    TKUnit.assert(saved, "Image not saved to file");
    TKUnit.assert(fs.File.exists(path), "Image not saved to file");
}

export function testFromFile() {
    // >> imagesource-load-local
    const folder = fs.knownFolders.documents();
    const path = fs.path.join(folder.path, "test.png");
    const img = imageSource.fromFile(path);
    // << imagesource-load-local

    TKUnit.assert(img.height > 0, "image.fromResource failed");

    // remove the image from the file system
    const file = folder.getFile("test.png");
    file.remove();
    TKUnit.assert(!fs.File.exists(path), "test.png not removed");
}

export function testFromAssetFileNotFound(done) {
    let asset = new imageAssetModule.ImageAsset("invalidFile.png");
    asset.options = {
        width: 0,
        height: 0,
        keepAspectRatio: true
    };

    imageSource.fromAsset(asset).then((source) => {
        done("Should not resolve with invalid file name.");
    }, (error) => {
        TKUnit.assertNotNull(error);
        done();
    });
}

export function testFromAssetSimple(done) {
    let asset = new imageAssetModule.ImageAsset(splashscreenPath);
    asset.options = {
        width: 0,
        height: 0,
        keepAspectRatio: true
    };

    imageSource.fromAsset(asset).then((source) => {
        TKUnit.assertEqual(source.width, splashscreenWidth);
        TKUnit.assertEqual(source.height, splashscreenHeight);
        done();
    }, (error) => {
        done(error);
    });
}

export function testFromAssetWithExactScaling(done) {
    let asset = new imageAssetModule.ImageAsset(splashscreenPath);
    let scaleWidth = 10;
    let scaleHeight = 11;
    asset.options = {
        width: scaleWidth,
        height: scaleHeight,
        keepAspectRatio: false,
        autoScaleFactor: false
    };

    imageSource.fromAsset(asset).then((source) => {
        TKUnit.assertEqual(source.width, scaleWidth);
        TKUnit.assertEqual(source.height, scaleHeight);

        const targetFilename = `splashscreenTemp.png`;
        const tempPath = fs.knownFolders.temp().path;
        const localFullPath = fs.path.join(tempPath, targetFilename);

        const fullImageSaved = source.saveToFile(localFullPath, "png");

        if (fullImageSaved) {
            let sourceImage = new imageSource.ImageSource();
            sourceImage.fromFile(localFullPath).then(() => {
                TKUnit.assertEqual(sourceImage.width, scaleWidth);
                TKUnit.assertEqual(sourceImage.height, scaleHeight);
                done();
            });
        } else {
            done(`Error saving photo to local temp folder: ${localFullPath}`);
        }
    }, (error) => {
        done(error);
    });
}

export function testFromAssetWithScalingAndAspectRatio(done) {
    let asset = new imageAssetModule.ImageAsset(splashscreenPath);
    let scaleWidth = 10;
    let scaleHeight = 11;
    asset.options = {
        width: scaleWidth,
        height: scaleHeight,
        keepAspectRatio: true
    };

    imageSource.fromAsset(asset).then((source) => {
        TKUnit.assertEqual(source.width, 18);
        TKUnit.assertEqual(source.height, scaleHeight);
        done();
    }, (error) => {
        done(error);
    });
}

export function testFromAssetWithScalingAndDefaultAspectRatio(done) {
    let asset = new imageAssetModule.ImageAsset(splashscreenPath);
    let scaleWidth = 10;
    let scaleHeight = 11;
    asset.options.width = scaleWidth;
    asset.options.height = scaleHeight;

    imageSource.fromAsset(asset).then((source) => {
        TKUnit.assertEqual(source.width, 18);
        TKUnit.assertEqual(source.height, scaleHeight);
        done();
    }, (error) => {
        done(error);
    });
}

export function testFromAssetWithBiggerScaling(done) {
    let asset = new imageAssetModule.ImageAsset(splashscreenPath);
    let scaleWidth = 600;
    let scaleHeight = 600;
    asset.options = {
        width: scaleWidth,
        height: scaleHeight,
        keepAspectRatio: false
    };

    imageSource.fromAsset(asset).then((source) => {
        TKUnit.assertEqual(source.width, scaleWidth);
        TKUnit.assertEqual(source.height, scaleHeight);
        done();
    }, (error) => {
        done(error);
    });
}

export function testNativeFields() {
    const img = imageSource.fromFile(imagePath);
    if (app.android) {
        TKUnit.assert(img.android != null, "Image.android not updated.");
    } else if (app.ios) {
        TKUnit.assert(img.ios != null, "Image.ios not updated.");
    }
}
const fullAndroidPng = "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAA3NCSVQICAjb4U/gAAAAFUlEQVQImWP8z4AAjAz/kTnIPGQAAG86AwGcuMlCAAAAAElFTkSuQmCC";
const fullIosPng = "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAAXNSR0IArs4c6QAAABxpRE9UAAAAAgAAAAAAAAACAAAAKAAAAAIAAAACAAAARiS4uJEAAAASSURBVBgZYvjPwABHSMz/DAAAAAD//0GWpK0AAAAOSURBVGNgYPiPhBgQAACEvQv1D5y/pAAAAABJRU5ErkJggg==";

const jpgImageAsBase64String = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAEAAQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+Pz/h5j+1Z/z9fBr/AMRt+AH/AM7uiiiv9fV9E36KOn/HMX0f+n/NlvDT/p3/ANUv/V3vrf8AP1nueaf8LOa9P+ZjjP8Ap3/0/wD6u99b/wD/2Q==";
const expectedJpegStart = "/9j/4AAQSkZJRgAB";
const expectedPngStart = "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAA";

export function testBase64Encode_PNG() {
    // >> imagesource-to-base-string
    const img = imageSource.fromFile(smallImagePath);
    let base64String = img.toBase64String("png");
    // << imagesource-to-base-string

    base64String = base64String.substr(0, expectedPngStart.length);
    TKUnit.assertEqual(
        base64String,
        expectedPngStart,
        "Base 64 encoded PNG");
}

export function testBase64Encode_PNG_WithQuality() {
    const img = imageSource.fromFile(smallImagePath);
    let base64String = img.toBase64String("png", 80);
    base64String = base64String.substr(0, expectedPngStart.length);
    TKUnit.assertEqual(
        base64String,
        expectedPngStart,
        "Base 64 encoded PNG");
}

export function testBase64Encode_JPEG() {
    const img = imageSource.fromFile(smallImagePath);

    let base64String = img.toBase64String("jpeg");
    base64String = base64String.substr(0, expectedJpegStart.length);

    TKUnit.assertEqual(
        base64String,
        expectedJpegStart,
        "Base 64 encoded JPEG");
}

export function testBase64Encode_JPEG_With_Quality() {
    const img = imageSource.fromFile(smallImagePath);

    let base64String = img.toBase64String("jpeg", 80);
    base64String = base64String.substr(0, expectedJpegStart.length);

    TKUnit.assertEqual(
        base64String,
        expectedJpegStart,
        "Base 64 encoded JPEG");
}

export function testLoadFromBase64Encode_JPEG() {
    // >> imagesource-from-base-string
    let img: imageSource.ImageSource;
    img = imageSource.fromBase64(jpgImageAsBase64String);
    // << imagesource-from-base-string

    TKUnit.assert(img !== null, "Actual: " + img);
    TKUnit.assertEqual(img.width, 4, "img.width");
    TKUnit.assertEqual(img.height, 4, "img.height");
}

export function testLoadFromBase64Encode_PNG() {
    let img: imageSource.ImageSource;
    if (app.android) {
        img = imageSource.fromBase64(fullAndroidPng);
    } else if (app.ios) {
        img = imageSource.fromBase64(fullIosPng);
    }

    TKUnit.assert(img !== null, "Actual: " + img);
    TKUnit.assertEqual(img.width, 4, "img.width");
    TKUnit.assertEqual(img.height, 4, "img.height");
}
