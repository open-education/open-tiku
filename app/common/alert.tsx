import { AlertTriangleIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';

/// 提示信息

interface SimpleAlertProps {
  title: string;
  message: string;
}
function SimpleAlert({ title, message }: SimpleAlertProps) {
  return (
    <Alert variant="destructive">
      <AlertTriangleIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export { SimpleAlert };
