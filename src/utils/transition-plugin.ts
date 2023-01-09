export const myPlugin = {
    beforeNavigation: async () => {
        if ("startViewTransition" in document) {
            // await (document as any).startViewTransition();
        }
    },
    afterNavigation: () => { }
}