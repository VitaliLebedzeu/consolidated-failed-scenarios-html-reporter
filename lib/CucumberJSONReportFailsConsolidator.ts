import { readFile, readFileSync } from 'node:fs'
import { FAIL_STEP_STATUS, MARK_SCENARIO_KEY, UNKNOWN_SCENARIO_PREFIX } from './constants/constants'
import { ProbableCauseOfFallFinder } from './utils/ProbableCauseOfFallFinder'
import { ShortCauseOfFallCreator } from './utils/ShortCauseOfFallCreator'

/**
 * CucumberJSONReportFailsConsolidator.js
 * 
 * Consolidates the failed scenarios from the cucumber report by the failed method and the point of fall
 */
export default class CucumberJSONReportFailsConsolidator {

    private unknownScenarioCounter = 0
    private failedScenariosConsolidation: Map<string, Array<string>> = new Map()

    constructor() { }

    /**
     * Consolidates and returns failed scenarios from the cucumber report as a map
     * where key is the failed method with a short point of fall and value is the array of consolidated scenario names
     * @param {string} cucumberJSONReportPath - path to the cucumber JSON report file
     * @returns the map of failed scenarios consolidation where key is the failed method with the point of fall and value is the list of failed scenarios
     */
    getFailedScenariosConsolidation(cucumberJSONReportPath: string): Map<string, Array<string>> {
        // TODO: Implement reporter
        // Logger.start(variables.defaultLoggerLevel, `${variables.outputDir}/logs/json-report-fails-consolidator.log`)
        const cucumberJSONReport = JSON.parse(readFileSync(cucumberJSONReportPath, { encoding:'utf8', flag:'r' }))

        const reportFailedScenariosList: any[] = this.enrichReportFailedScenariosList(cucumberJSONReport)
        this.enrichFailedScenariosConsolidation(reportFailedScenariosList)
        return this.failedScenariosConsolidation
    }

    /**
     * Parse the cucumber JSON report and enrich the failed scenarios list with cucumber failed scenarios
     * @param JSONReport - cucumber JSON report as .json file
     */
    private enrichReportFailedScenariosList(JSONReport: any): any[] {
        // TODO: Implement reporter
        // Logger.info('[jsonReportFailsConsolidator._enrichReportFailedScenariosList()] start to collect report failed scenarios')
        const reportFailedScenariosList: any[] = []
        JSONReport.forEach((feature: { elements: any[] }) => {
            const featureFailedScenarios = this.getFeatureFailedScenarios(feature)
            reportFailedScenariosList.push(...featureFailedScenarios)
        })

        // TODO: Implement reporter
        // Logger.info('[jsonReportFailsConsolidator._enrichReportFailedScenariosList()] collecting report failed scenarios is finished')
        // Logger.info(`[jsonReportFailsConsolidator._enrichReportFailedScenariosList()] report's failed scenarios quantity [ ${reportFailedScenariosList.length} ]`)
        return reportFailedScenariosList
    }

    /**
     * Parse the cucumber report's feature and return the scenarios list that contains a failed step
     * @param feature - from the cucumber JSON report
     * @returns the failed scenarios list
     */
    private getFeatureFailedScenarios(feature: { elements: any[] }): any {
        return feature.elements.filter(scenario => this.isScenarioFailed(scenario))
    }

    /**
     * Verify that scenario has or not a failed step
     * @param scenario - from the cucumber JSON report
     * @returns true or false accordance from that has a scenario failed step or not
     */
    private isScenarioFailed(scenario: { steps: { result: { status: string } }[] }) {
        return scenario.steps.map((step: { result: { status: string } }) => step.result.status).some((status: string) => status === FAIL_STEP_STATUS)
    }

    /**
     * Consolidate failed scenarios by failed method and enrich the collection
     */
    private enrichFailedScenariosConsolidation(reportFailedScenariosList: Array<any>) {
        // Logger.debug('[jsonReportFailsConsolidator._enrichConsolidatedReportFailedScenariosCollection()] start to enrich consolidated failed report scenarios collection')
        reportFailedScenariosList.map(failedScenario => {
            const failedScenarioName = MARK_SCENARIO_KEY ? this.getScenarioNameByKeyRegex(failedScenario.name, MARK_SCENARIO_KEY) : failedScenario.name
            // Logger.debug(`[jsonReportFailsConsolidator._enrichConsolidatedReportFailedScenariosCollection()] failed scenario name [ ${failedScenarioName} ]`)
            const scenarioCauseOfFall = ProbableCauseOfFallFinder.getProbableCauseOfFall(this.getFailedScenarioStep(failedScenario))
            // Logger.debug(`[jsonReportFailsConsolidator._enrichConsolidatedReportFailedScenariosCollection()] scenario's cause of fall [ ${scenarioCauseOfFall} ]`)

            const collectionKey = ShortCauseOfFallCreator.createShortCauseOfFall(scenarioCauseOfFall)

            if (this.failedScenariosConsolidation.has(collectionKey)) {
                const collectionValue = this.failedScenariosConsolidation.get(collectionKey)
                if (collectionValue && !collectionValue.includes(failedScenarioName)) {
                    collectionValue.push(failedScenarioName)
                    this.failedScenariosConsolidation.set(collectionKey, collectionValue)
                }
            } else {
                this.failedScenariosConsolidation.set(collectionKey, [failedScenarioName])
            }
        })
    }

    /**
     * Substrings and returns scenario name by determined regex or default unknown name
     * @param scenarioName - full scenario name
     * @param scenarioKeyRegex - regex for substring a scenario name
     * @returns new scenario name that accordance to the regex or default unknown name
     */
    private getScenarioNameByKeyRegex(scenarioName: string, scenarioKeyRegex: string) {
        const regexMatches = scenarioName.match(scenarioKeyRegex)
        if (regexMatches === null) {
            this.unknownScenarioCounter++
            return `${UNKNOWN_SCENARIO_PREFIX}-${this.unknownScenarioCounter}`
        } else {
            return regexMatches[0]
        }
    }

    /**
     * Finds and returns failed scenario step
     * @param scenario - failed scenario 
     * @returns failed scenario step
     */
    private getFailedScenarioStep(scenario: { steps: any[] }) {
        return scenario.steps.find(step => step.result.status === FAIL_STEP_STATUS)
    }
}
