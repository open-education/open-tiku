import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangleIcon, InfoIcon } from 'lucide-react';

type AlertVariant = React.ComponentProps<typeof Alert>['variant'];

/// 提示信息

interface SimpleAlertProps {
  title: string;
  message: string;
  variant?: AlertVariant;
}
function SimpleAlert({ title, message, variant = 'destructive' }: SimpleAlertProps) {
  const Icon = variant === 'destructive' ? AlertTriangleIcon : InfoIcon;

  return (
    <Alert variant={variant}>
      <Icon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export { SimpleAlert };
