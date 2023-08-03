import axios from 'axios';
import { format } from 'date-fns';
import fetchApiUrl from './fetchPerformanceApiConfig';

interface PerformanceData {
    Scenario: string;
    DateofRun: string;
    Threshold: number;
    ExecutionTime: number;
}

export async function PerformanceTestResult(performanceTestData) {
    try {
        const perfApiUrl = fetchApiUrl('DefaultSettings');
        const apiUrl = perfApiUrl.apiUrl;
        const response = await axios.post(apiUrl, JSON.stringify(performanceTestData), {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log(response.status);
        console.log("Data sent to API Successfully", response);
    } catch (error) {
        console.error("Error while sendind data:", error);
    }
}

export function createPerformanceData(Sceanrio: string, executionTime: number, threshold: number): PerformanceData {

    const currentDate = new Date();
    const formattedDate = format(currentDate, 'yyyy-MM-dd hh:mm a');

    const data: PerformanceData = {
        "Scenario": `${Sceanrio}`,
        "DateofRun": formattedDate,
        "Threshold": threshold,
        "ExecutionTime": executionTime,
    };

    console.log("Performance data created", data);
    return data;
}