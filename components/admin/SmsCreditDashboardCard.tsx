import Link from 'next/link';
import type { DashboardSmsCredit } from '@/lib/sms-credit-types';

type Props = {
  smsCredit: DashboardSmsCredit;
};

const BUY_HREF = null;

export function SmsCreditDashboardCard({ smsCredit }: Props) {
  const blinkLow = smsCredit.status === 'ok' && smsCredit.level === 'low';
  const blinkEmpty = smsCredit.status === 'ok' && smsCredit.level === 'empty';
  const showTopUp = smsCredit.status !== 'not_connected' && BUY_HREF !== null;

  const borderClass =
    smsCredit.status === 'ok' && smsCredit.level === 'empty'
      ? 'border-red-300'
      : smsCredit.status === 'ok' && smsCredit.level === 'low'
        ? 'border-amber-300'
        : 'border-gray-200';

  const iconBg =
    smsCredit.status === 'ok' && smsCredit.level === 'empty'
      ? 'bg-red-100 text-red-700'
      : smsCredit.status === 'ok' && smsCredit.level === 'low'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-blue-100 text-blue-700';

  let mainValue: string;
  let subline: string | null = null;

  if (smsCredit.status === 'not_connected') {
    mainValue = 'SMS is not connected';
  } else if (smsCredit.status === 'load_failed') {
    mainValue = '—';
    subline = 'The balance could not be loaded';
  } else {
    mainValue = smsCredit.sms_left.toLocaleString('en-GH');
    if (smsCredit.level === 'low') {
      subline = 'Running low, top up soon';
    } else if (smsCredit.level === 'empty') {
      subline = 'SMS credit is empty, texts are not being sent';
    } else {
      subline = 'texts left';
    }
  }

  const sublineClass =
    smsCredit.status === 'ok' && smsCredit.level === 'empty'
      ? 'text-red-700 font-medium'
      : smsCredit.status === 'ok' && smsCredit.level === 'low'
        ? 'text-amber-700 font-medium'
        : 'text-gray-600';

  const valueSizeClass =
    smsCredit.status === 'not_connected' ? 'text-base leading-snug font-bold' : 'text-2xl font-bold';

  const blinkClass =
    blinkEmpty ? 'sms-credit-double-blink-empty' : blinkLow ? 'sms-credit-double-blink' : '';

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${borderClass} ${blinkClass}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${iconBg}`}>
          <i className="ri-message-2-line text-2xl" aria-hidden />
        </div>
        {showTopUp && BUY_HREF ? (
          <Link href={BUY_HREF} className="inline-flex items-center justify-center px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors">
            Top up
          </Link>
        ) : null}
      </div>
      <h3 className={`text-gray-900 mb-1 tabular-nums ${valueSizeClass}`}>{mainValue}</h3>
      <p className="text-gray-600 text-sm">SMS credit</p>
      {subline ? <p className={`mt-2 text-sm ${sublineClass}`}>{subline}</p> : null}
    </div>
  );
}
