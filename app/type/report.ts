import type { FileInfo } from '@/type/paper';

export interface ReportAddReq {
	id?: number;
	reportType: number;
	reportId: number;
	value: string;
	label: string;
	desc: string;
	content: string;
	sourceUrl: string;
	fileList: FileInfo[];
}
