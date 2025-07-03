import type { INodeTypeBaseDescription, IVersionedNodeType } from 'n8n-workflow';
import { VersionedNodeType } from 'n8n-workflow';

import { EmailSendV2 } from './v2/EmailSendV2.node';

export class BetterEmailSend extends VersionedNodeType {
	constructor() {
		const baseDescription: INodeTypeBaseDescription = {
			displayName: 'Better Send Email',
			name: 'betterEmailSend',
			icon: 'fa:envelope',
			group: ['output'],
			defaultVersion: 2,
			description: 'Sends an email using SMTP protocol allowing custom headers',
		};

		const nodeVersions: IVersionedNodeType['nodeVersions'] = {
			2: new EmailSendV2(baseDescription),
		};

		super(nodeVersions, baseDescription);
	}
}
