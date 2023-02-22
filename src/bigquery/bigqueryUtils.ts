import { BigQueryUtil } from "@crypto-jambot/bigquery-utils";

export function getAddresses() {
    return new Promise<string[]>(async (resolve, reject) => {
        try {
            const query = `SELECT pool
                           FROM \`crypto-351521.ethereum_v2.refined_pools\``;
            const result = (
                await new BigQueryUtil().query<{ pool: string }>(query)
            ).map((row) => row.pool);
            resolve(result);
        } catch (err) {
            reject(err);
        }
    });
}
