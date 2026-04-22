import 'dotenv/config';

export interface BeehiivConfig {
	apiKey: string;
	publicationId: string;
	baseUrl: string;
	enabled: boolean;
}

export const beehiivConfig: BeehiivConfig = {
	apiKey: process.env.BEEHIIV_API_KEY || '',
	publicationId: process.env.BEEHIIV_PUBLICATION_ID || '',
	baseUrl: process.env.BEEHIIV_BASE_URL || 'https://api.beehiiv.com/v2',
	enabled: process.env.BEEHIIV_ENABLED === 'true',
};
