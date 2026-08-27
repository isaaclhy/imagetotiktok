'use client';

import {
  IMAGE_TEMPLATE3_IMESSAGE_BG,
  IMAGE_TEMPLATE3_IMESSAGE_BUBBLE,
  IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK,
  IMAGE_TEMPLATE3_IMESSAGE_HEADER,
  IMAGE_TEMPLATE3_IMESSAGE_INCOMING_BUBBLE,
  IMAGE_TEMPLATE3_IMESSAGE_TEXT,
} from '@/app/lib/image-template-3-imessage';

type ImageTemplate3ImessageBubbleProps = {
  question: string;
  replies?: string[] | null;
  /** Shown under the outgoing bubble. */
  deliveryStatus?: 'Delivered' | 'Read';
  replyLoading?: boolean;
};

/** Preview: black Messages screen — you ask (blue), boyfriend replies (gray bubbles). */
export function ImageTemplate3ImessageBubble({
  question,
  replies,
  deliveryStatus = 'Delivered',
  replyLoading = false,
}: ImageTemplate3ImessageBubbleProps) {
  const text = question.trim();
  const replyList = (replies ?? []).map((r) => r.trim()).filter(Boolean);

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col"
      style={{ backgroundColor: IMAGE_TEMPLATE3_IMESSAGE_BG }}
    >
      <div className="flex flex-1 flex-col justify-center gap-2.5 px-[6%] pb-[8%]">
        {text ? (
          <div className="flex flex-col items-end gap-1.5">
            <div className="relative max-w-[72%]">
              <div
                className="rounded-[1.15em] px-[0.9em] py-[0.55em] text-[13px] sm:text-[15px] md:text-[16px] leading-snug wrap-break-word"
                style={{
                  backgroundColor: IMAGE_TEMPLATE3_IMESSAGE_BUBBLE,
                  color: IMAGE_TEMPLATE3_IMESSAGE_TEXT,
                  fontFamily: IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK,
                  borderBottomRightRadius: '0.35em',
                }}
              >
                {text}
              </div>
              <svg
                aria-hidden
                className="pointer-events-none absolute -right-[6px] -bottom-[5px] h-4 w-3.5"
                viewBox="0 0 14 16"
                fill={IMAGE_TEMPLATE3_IMESSAGE_BUBBLE}
              >
                <path d="M1.2 1.2C2.8 0.4 5.2 0.2 7.2 1.6C9.8 3.4 12.4 7.2 13.6 14.2C10.2 11.8 7.4 10.6 4.8 10.2C2.6 9.9 1.1 10.4 0.4 11.2C0.9 7.4 0.6 3.6 1.2 1.2Z" />
              </svg>
            </div>
            <span
              className="pr-0.5 text-[10px] sm:text-[11px]"
              style={{
                color: IMAGE_TEMPLATE3_IMESSAGE_HEADER,
                fontFamily: IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK,
              }}
            >
              {deliveryStatus}
            </span>
          </div>
        ) : null}

        {replyLoading ? (
          <div className="flex justify-start">
            <div
              className="rounded-[1.15em] px-[0.9em] py-[0.55em] text-[12px] sm:text-[13px]"
              style={{
                backgroundColor: IMAGE_TEMPLATE3_IMESSAGE_INCOMING_BUBBLE,
                color: IMAGE_TEMPLATE3_IMESSAGE_HEADER,
                fontFamily: IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK,
              }}
            >
              …
            </div>
          </div>
        ) : (
          replyList.map((replyText, i) => {
            const isLast = i === replyList.length - 1;
            return (
              <div key={`${i}-${replyText.slice(0, 24)}`} className="flex justify-start">
                <div className="relative max-w-[72%]">
                  <div
                    className="rounded-[1.15em] px-[0.9em] py-[0.55em] text-[13px] sm:text-[15px] md:text-[16px] leading-snug wrap-break-word"
                    style={{
                      backgroundColor: IMAGE_TEMPLATE3_IMESSAGE_INCOMING_BUBBLE,
                      color: IMAGE_TEMPLATE3_IMESSAGE_TEXT,
                      fontFamily: IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK,
                      borderBottomLeftRadius: isLast ? '0.35em' : undefined,
                    }}
                  >
                    {replyText}
                  </div>
                  {isLast ? (
                    <svg
                      aria-hidden
                      className="pointer-events-none absolute -left-[6px] -bottom-[5px] h-4 w-3.5"
                      viewBox="0 0 14 16"
                      fill={IMAGE_TEMPLATE3_IMESSAGE_INCOMING_BUBBLE}
                    >
                      <path d="M12.8 1.2C11.2 0.4 8.8 0.2 6.8 1.6C4.2 3.4 1.6 7.2 0.4 14.2C3.8 11.8 6.6 10.6 9.2 10.2C11.4 9.9 12.9 10.4 13.6 11.2C13.1 7.4 13.4 3.6 12.8 1.2Z" />
                    </svg>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
