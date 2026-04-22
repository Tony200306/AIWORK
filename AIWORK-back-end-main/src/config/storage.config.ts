import 'dotenv/config';

export interface StorageConfig {
	endpoint?: string; // MinIO endpoint (if provided, uses MinIO; otherwise AWS S3)
	accessKey: string;
	secretKey: string;
	bucket: string;
	region?: string; // AWS region (for S3) or MinIO
	useSSL: boolean;
	port?: number; // MinIO port
	enabled: boolean;
}

const useSSL = process.env.STORAGE_USE_SSL === 'true';
const defaultPort = useSSL ? 443 : 9000;
const parsedPort = parseInt(process.env.STORAGE_PORT as string, 10);

export const storageConfig: StorageConfig = {
	endpoint: process.env.STORAGE_ENDPOINT, // If not provided, uses AWS S3 default endpoints
	accessKey: process.env.STORAGE_ACCESS_KEY || 'minioadmin',
	secretKey: process.env.STORAGE_SECRET_KEY || 'minioadmin',
	bucket: process.env.STORAGE_BUCKET || 'vantum-files',
	region: process.env.STORAGE_REGION || 'us-east-1',
	useSSL,
	port: isNaN(parsedPort) ? defaultPort : parsedPort,
	enabled: process.env.STORAGE_ENABLED !== 'false',
};

