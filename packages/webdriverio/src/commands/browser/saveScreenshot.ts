import fs from 'node:fs'
import { getAbsoluteFilepath, assertDirectoryExists } from '../../utils/index.js'

/**
 *
 * Save a screenshot of the current browsing context to a PNG file on your OS. Be aware that
 * some browser drivers take screenshots of the whole document (e.g. Geckodriver with Firefox)
 * and others only of the current viewport (e.g. Chromedriver with Chrome).
 *
 * <example>
    :saveScreenshot.js
    it('should save a screenshot of the browser view', async () => {
        await browser.saveScreenshot('./some/path/screenshot.png');
    });
 * </example>
 *
 * @alias browser.saveScreenshot
 * @param   {String}  filepath  path to the generated image (`.png` suffix is required) relative to the execution directory
 * @return  {Buffer}            screenshot buffer
 * @type utility
 *
 */
export async function saveScreenshot (
    this: WebdriverIO.Browser,
    filepath: string
) {
    /**
     * type check
     */
    if (typeof filepath !== 'string' || !filepath.endsWith('.png')) {
        throw new Error('saveScreenshot expects a filepath of type string and ".png" file ending')
    }

    const absoluteFilepath = getAbsoluteFilepath(filepath)
    await assertDirectoryExists(absoluteFilepath)

    let screenBuffer: string
    if (this.isBidi) {
        const { contexts } = await this.browsingContextGetTree({})
        const { data } = await this.browsingContextCaptureScreenshot({
            context: contexts[0].context
        })
        screenBuffer = data
      else {
        try {
            screenBuffer = await this.takeScreenshot();
        } catch (error) {
            console.log('this.takeScreenshot failed with error',error)
        }
    }
    if(screenBuffer){
        const screenshot = Buffer.from(screenBuffer, 'base64');
        fs.writeFileSync(absoluteFilepath, screenshot);
        return screenshot;
    }
}
