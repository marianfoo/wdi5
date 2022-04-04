async function clientSide_getControls(controlSelector) {
    controlSelector = await Promise.resolve(controlSelector) // to plug into fluent async api
    return await browser.executeAsync((controlSelector, done) => {
        const waitForUI5Options = Object.assign({}, window.wdi5.waitForUI5Options)
        if (controlSelector.timeout) {
            waitForUI5Options.timeout = controlSelector.timeout
        }
        window.bridge
            .waitForUI5(waitForUI5Options)
            .then(() => {
                window.wdi5.Log.info("[browser wdi5] locating " + JSON.stringify(controlSelector))
                controlSelector.selector = window.wdi5.createMatcher(controlSelector.selector)
                return window.bridge.findAllDOMElementsByControlSelector(controlSelector)
            })
            .then((domElements) => {
                // window.wdi5.Log.info('[browser wdi5] control located! - Message: ' + JSON.stringify(domElement));
                // ui5 control
                let returnElements = []
                domElements.forEach((domElement) => {
                    const ui5Control = window.wdi5.getUI5CtlForWebObj(domElement)
                    const id = ui5Control.getId()
                    window.wdi5.Log.info(`[browser wdi5] control with id: ${id} located!`)
                    const aProtoFunctions = window.wdi5.retrieveControlMethods(ui5Control)
                    // @type [String, String?, String, "Array of Strings"]
                    returnElements.push({ domElement: domElement, id: id, aProtoFunctions: aProtoFunctions })
                })

                done(["success", returnElements])
            })
            .catch((error) => {
                window.wdi5.Log.error("[browser wdi5] ERR: ", error)
                done(["error", error.toString()])
            })
    }, controlSelector)
}

module.exports = {
    clientSide_getControls
}
