import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';

import { fromEmailProperty, toEmailProperty } from './descriptions';
import { configureTransport } from './utils';
import { configureWaitTillDate } from '../../../utils/sendAndWait/configureWaitTillDate.util';
import {
	createEmailBodyWithN8nAttribution,
	createEmailBodyWithoutN8nAttribution,
} from '../../../utils/sendAndWait/email-templates';
import {
	createButton,
	getSendAndWaitConfig,
	getSendAndWaitProperties,
} from '../../../utils/sendAndWait/utils';

const customHeadersProperty: INodeProperties = {
	displayName: 'Custom Headers',
	name: 'customHeadersUi',
	placeholder: 'Add Custom Header',
	type: 'fixedCollection',
	typeOptions: {
		multipleValues: true,
	},
	default: {},
	description: 'Add custom headers to the email',
	options: [
		{
			name: 'headers',
			displayName: 'Headers',
			values: [
				{
					displayName: 'Name',
					name: 'name',
					type: 'string',
					default: '',
					description: 'Name of the header',
				},
				{
					displayName: 'Value',
					name: 'value',
					type: 'string',
					default: '',
					description: 'Value of the header',
				},
			],
		},
	],
};

export const description: INodeProperties[] = getSendAndWaitProperties(
	[fromEmailProperty, toEmailProperty],
	'email',
	[customHeadersProperty],
);

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const fromEmail = this.getNodeParameter('fromEmail', 0) as string;
	const toEmail = this.getNodeParameter('toEmail', 0) as string;

	const config = getSendAndWaitConfig(this);
	const buttons: string[] = [];
	for (const option of config.options) {
		buttons.push(createButton(config.url, option.label, option.value, option.style));
	}

	let htmlBody: string;

	if (config.appendAttribution !== false) {
		const instanceId = this.getInstanceId();
		htmlBody = createEmailBodyWithN8nAttribution(config.message, buttons.join('\n'), instanceId);
	} else {
		htmlBody = createEmailBodyWithoutN8nAttribution(config.message, buttons.join('\n'));
	}

	const mailOptions: IDataObject = {
		from: fromEmail,
		to: toEmail,
		subject: config.title,
		html: htmlBody,
	};

	// Add custom headers if any were provided
	const customHeadersUi = this.getNodeParameter('customHeadersUi', 0, {}) as IDataObject;
	if (customHeadersUi && Array.isArray((customHeadersUi as IDataObject).headers)) {
		const headersArray = (customHeadersUi as IDataObject).headers as IDataObject[];
		const headers: IDataObject = {};
		for (const header of headersArray) {
			if (header.name) {
				headers[header.name as string] = header.value as string;
			}
		}
		if (Object.keys(headers).length) {
			mailOptions.headers = headers;
		}
	}

	const credentials = await this.getCredentials('smtp');
	const transporter = configureTransport(credentials, {});

	await transporter.sendMail(mailOptions);

	const waitTill = configureWaitTillDate(this);

	await this.putExecutionToWait(waitTill);
	return [this.getInputData()];
}
