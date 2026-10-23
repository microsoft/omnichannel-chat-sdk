import { createHttpHeaders } from "@azure/core-rest-pipeline";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";
import { createNoRetryChatThreadClient } from "../../../src/core/messaging/ACSClient";

describe("ACS send transport", () => {
    it("should make one HTTP attempt when ACS returns a retryable response", async () => {
        let requestCount = 0;
        const httpClient = {
            sendRequest: jest.fn(async (request) => {
                requestCount++;
                return {
                    request,
                    status: 503,
                    headers: createHttpHeaders({
                        "content-type": "application/json"
                    }),
                    bodyAsText: JSON.stringify({
                        error: {
                            code: "ServiceUnavailable",
                            message: "Unavailable"
                        }
                    })
                };
            })
        };
        const credential = new AzureCommunicationTokenCredential(
            "eyJhbGciOiJub25lIn0.eyJleHAiOjQxMDc0NzIwMDB9."
        );
        const client = createNoRetryChatThreadClient(
            "https://example.communication.azure.com",
            "thread-id",
            credential,
            { httpClient }
        );

        await expect(client.sendMessage({ content: "message" })).rejects.toBeDefined();

        expect(requestCount).toBe(1);
        expect(httpClient.sendRequest).toHaveBeenCalledTimes(1);
    });
});
