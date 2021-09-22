import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const isBuildEnvironment = !context.req.url.includes("localhost");
    context.log("isBuildEnvironment", context.req.url, isBuildEnvironment);
    let EditingRenderMiddleware;
    
    if (isBuildEnvironment) {
        EditingRenderMiddleware = require('../../../jss-nextjs-app/node_modules/@sitecore-jss/sitecore-jss-nextjs/middleware').EditingRenderMiddleware;
    } else {
        EditingRenderMiddleware = require('@nextjsonazure/jss-nextjs-app/node_modules/@sitecore-jss/sitecore-jss-nextjs/middleware').EditingRenderMiddleware;
    }
    
    const parsedUrl = new URL(context.req.url);

    const port = isBuildEnvironment ? '' : ':3000';
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}${port}`
    
    // Wire up the EditingRenderMiddleware handler
    const handler = new EditingRenderMiddleware({ resolveServerUrl: () => baseUrl }).getHandler();
    
    const customContextRes: any = context.res;

    customContextRes.status = (statusCode: number) => {
        customContextRes.status = statusCode;

        return customContextRes;
    }

    customContextRes.json = (jsonData) => {
        customContextRes.body = JSON.stringify(jsonData);

        return customContextRes;
    }

    try {
        // @ts-ignore
        await handler(context.req, customContextRes);

    } catch (e) {
        context.log(e);
        context.res = {
            status: 500
        };
    }

};

export default httpTrigger;
