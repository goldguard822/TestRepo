document.writeln('<scri'+'pt type="text/javascript" src="./js/jquery.touchSwipe.min.js"></scri'+'pt>"'); // 터치 스와이프 JS 경로 확인 필수
document.writeln('<link type="text/css" href="./css/touchslide_ad.css" rel="stylesheet" />'); // 터치 스와이프 CSS 경로 확인 필수

/* 광고 보기 버튼 S */
document.writeln('<div role="banner_wrap">');
document.writeln('  <span role="banner_area" class="banner_area_top"></span>');
document.writeln('  <span role="banner_area" class="banner_area_bottom"></span>');
document.writeln('</div>');
/* 광고 보기 버튼 E */

/* 실제 광고 노출 영역 S */
document.writeln('<div role="ad_area">');
document.writeln('  <span role="slide_close"></div>');
document.writeln('  <scri'+'pt type="text/javascript" src="//tm.interworksmedia.co.kr/ads.js/9D2DCDA5"></scri'+'pt>"'); // 이 부분에 광고 스크립트 들어가야 함
document.writeln('</div>');
/* 실제 광고 노출 영역 E */

<script>
  //광고 스와이프 UP시 노출
  $("span[role='banner_area']").swipe({
    tap:function(event, target) {
      $("div[role='ad_area']").animate({
        top: "50%"
      }, 500);
    },
    swipeUp:function(event, distance, duration, fingerCount, fingerData, currentDirection) {
        $("div[role='ad_area']").animate({
          top: "50%"
        }, 500);
    },
    threshold:1,
    allowPageScroll:"vertical"
  });

  //스와이프 UP으로 노출된 광고 닫기
  $("span[role='slide_close']").swipe({
    tap:function(event, target) {
      $("div[role='ad_area']").animate({
        top: "100%"
      }, 500);
    },
    swipeDown:function(event, distance, duration, figerCount, fingerData, currentDirection) {
      $("div[role='ad_area']").animate({
        top: "100%"
      }, 500);
    },
    threshold:1,
    allowPageScroll:"vertical"
  });
</script>
