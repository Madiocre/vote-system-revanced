export default function AdvertCard() {
  return (
    <div className="advert-card">
      <span className="advert-card-small-text">The Best!</span>
      <span className="advert-card-title">المزيد من تفاصيل الجائزة</span>
      <div className="advert-card-buttons">
        <a href="https://www.facebook.com/NationalYouthUnion" className="advert-card-button">
          <span className="advert-card-icon">
            <svg width="34" height="34" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
              <path d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256C0 376 82.7 476.8 194.2 504.5V334.2H141.4V256h52.8V222.3c0-87.1 39.4-127.5 125-127.5c16.2 0 44.2 3.2 55.7 6.4V172c-6-.6-16.5-1-29.6-1c-42 0-58.2 15.9-58.2 57.2V256h83.6l-14.4 78.2H287V510.1C413.8 494.8 512 386.9 512 256h0z" fill="white" />
            </svg>
          </span>
          <div className="advert-card-button-text advert-card-facebook">
            <span>اضغط هنا</span>
            <span>اضغط هنا</span>
          </div>
        </a>
        <a href="https://www.facebook.com/share/p/ejW1kRsn2v3bQ7yZ/?mibextid=oFDknk" className="advert-card-button">
          <span className="advert-card-icon">
            <svg width="34" height="34" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
              <path d="M512 240c0 114.9-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6C73.6 471.1 44.7 480 16 480c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4c0 0 0 0 0 0s0 0 0 0l.3-.3c.3-.3 .7-.7 1.3-1.4c1.1-1.2 2.8-3.1 4.9-5.7c4.1-5 9.6-12.4 15.2-21.6c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208z" />
            </svg>
          </span>
          <div className="advert-card-button-text advert-card-comment">
            <span>اكتب تعليق هنا</span>
            <span>التعليقات</span>
          </div>
        </a>
      </div>
    </div>
  );
}