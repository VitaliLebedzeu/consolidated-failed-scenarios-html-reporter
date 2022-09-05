import { EXCLUDED_PROBABLE_CAUSE_FILTER, PROBABLE_CAUSE_FILTER } from "../constants/constants"

export class ProbableCauseOfFallFinder {
    private static readonly SPLITTER = /\r?\n|\r/g
    private static readonly FILTER_CAUSE_OF_FALL = /^\s+at/g
    private static readonly MARK_INVALID_CAUSE_OF_FALL = / \w:/g

    constructor() { }

    /**
     * Parse and returns all causes of fall
     * @param failedScenario - cucumber failed scenario
     * @returns all causes of fall as array
     */
    static getProbableCauseOfFall(failedScenario: { result: { error_message: string } }): string {
        const allCausesOfFall = failedScenario.result.error_message.split(this.SPLITTER)
            .filter((line: string) => line.match(this.FILTER_CAUSE_OF_FALL))
        const firstProbableCauseOfFall = allCausesOfFall.find((cause: string) => this.isProbableCause(cause))
        return firstProbableCauseOfFall ? firstProbableCauseOfFall : this.getFirstValidCauseOfFall(allCausesOfFall)
    }

    /**
     * Determines and returns that is the cause of fall probable or not
     * @param causeOfFall - cause of fall from the error stack trace
     * @returns returns true or false depends of the is the cause of the fall probable or not
     */
    private static isProbableCause(cause: String): boolean {
        const isProbableCause = PROBABLE_CAUSE_FILTER.some((filter: string) => cause.includes(filter))
        const isNotExcludedProbableCause = EXCLUDED_PROBABLE_CAUSE_FILTER.every((matcher: string) => !cause.includes(matcher))
        return isProbableCause && isNotExcludedProbableCause
    }

    /**
     * Finds and returns first valid cause of fall
     * @param allCausesOfFall - all causes of fall from th stack trace
     * @returns first desired cause that is match for matchers
     */
    private static getFirstValidCauseOfFall(allCausesOfFall: string[]): string {
        const firstValidCauseOfFall = allCausesOfFall.find(cause => cause.match(this.MARK_INVALID_CAUSE_OF_FALL) === null)
        return firstValidCauseOfFall ? firstValidCauseOfFall : allCausesOfFall[0]
    }
}
