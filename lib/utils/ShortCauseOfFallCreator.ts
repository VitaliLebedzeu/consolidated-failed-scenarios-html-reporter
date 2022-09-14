import path from 'path'

export class ShortCauseOfFallCreator {
    private static readonly SPLITTER = / +/g

    constructor() { }

    /**
     * Creates and returns a short cause of fall from the full
     * @param causeOfFall - probable the full cause of fall from the error stack trace
     * @returns a short cause of fall
     */
    static createShortCauseOfFall(causeOfFall: string): string {
        const causeOfFallPieces = causeOfFall.split(this.SPLITTER)
        const pointOfFall = this.getShortPointOfFall(causeOfFallPieces.pop())
        const methodOfFall = causeOfFallPieces.pop()
        return `${methodOfFall} (${pointOfFall}`
    }

    /**
     * Finds and returns the short point of fall full
     * Example: (method.js:row:column)
     * @param pointOfFall - the full point of fall
     * @returns short point of fall
     */
    private static getShortPointOfFall(pointOfFall: String | undefined): string {
        return pointOfFall ? pointOfFall.substring(pointOfFall.lastIndexOf(path.sep) + 1) : ')'
    }
}
