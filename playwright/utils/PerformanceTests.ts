import axios from 'axios';


async function  PerformanceTestResult(performanceDataTestCol) {
    try {
        
        const apiUrl = "https://prod-26.eastus.logic.azure.com/workflows/5de785a0c3df4db69a57e7cba8366520/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ZAmQVLtFkyMF_QXde5BREz7LZGAoudT3ZmS32SANbls";
    
        const response = await axios.post(apiUrl, JSON.stringify(performanceDataTestCol), {
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
export {PerformanceTestResult};