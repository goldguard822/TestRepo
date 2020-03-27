document.writeln('<link type="text/css" href="http://admaster.kode.co.kr/adsrc/scrollad-mid.css" rel="stylesheet" />');







document.writeln(' <section class="mythiell-full" style="height:600px">');        
document.writeln('	  <div class="mythiell-wrap-full" style="height:600px">');
document.writeln('		  <div class="mythiell-ad-full" style="border:1px solid #000; height:600px">');
document.writeln('            <scri'+'pt type="text/javascript" src="//tm.interworksmedia.co.kr/ads.js/4DA3CE5E"></scri'+'pt>'); // 이 부분에 광고 스크립트 들어가야 함

document.writeln('          <div class="mythiell-logo-top top right">');
document.writeln('            <div><img src="http://admaster.kode.co.kr/adsrc/logo.png" alt="mythiell"/></div>');
document.writeln('          </div>');

document.writeln('        </div>');
document.writeln('	  </div>');
document.writeln('  </section>');




$(function(){
//화면 크기 구하기
var DocHeight =  $(window).height();
//초기 광고 기준 좌표
var mythielladTop = $('.mythiell-mid').offset().top;
//광고 높이
var mythiellHeight = $('.mythiell-mid').height();
//초기 값
var mythiellBasic = mythielladTop + mythiellHeight;
if(DocHeight > mythiellBasic){
	$('.mythiell-ad').addClass('mythiell-up');
  }
});

// 중간광고 노출여부
var showMid = false;

// 하단광고 노출여부
var showFull = false;

// 하단 풀광고 높이
var fullAdHeight = 600;

$(window).scroll(function(event){ 
try
{
  //화면 해상도 구하기 
  var screenHeight  = screen.height;
  var DocHeight   =  $(window).height(); 
  //스크롤 위치 구하기
  var DocTop = $(document).scrollTop();
  //로고 높이
  var logoheight = $('.mythiell-logo').height();
  //화면크기+스크롤위치          
  var ScrollPos = screenHeight+DocTop;
  var ScrollPos2 = DocHeight+DocTop;
  //광고 기준 좌표
  var mythielladTop = $('.mythiell-mid').offset().top;
  //광고 높이
  var mythiellHeight = $('.mythiell-mid').height();
  var mythiellStartPoint = mythielladTop+mythiellHeight; 
  var mythiellFullHeight = $('.mythiell-full').offset().top;

  //광고가 탑에 위치할때
  var mythiellTop = mythielladTop+DocHeight;
  //스크롤 + 로고 높이
  var scrolllogo = ScrollPos+logoheight;
  //광고 하단이 탑에 위치
  var scrollbot = mythiellTop+mythiellHeight;          
  //변수 
  var mythiellfunction = DocTop+mythiellHeight;         

  if(mythielladTop > mythiellfunction){
	//올릴때            
	if(ScrollPos-64 > mythiellStartPoint){
	  $('.mythiell-ad').addClass('mythiell-up');
	  
	}else if(ScrollPos-64 < mythiellStartPoint){
	  $('.mythiell-ad').removeClass('mythiell-up');
	}
  }else if(mythielladTop < mythiellfunction){  
	//내릴때            
	if(ScrollPos2 > mythiellTop){
	  $('.mythiell-ad').removeClass('mythiell-up');
	  $('.mythiell-ad').addClass('mythiell-down'); 

	}else if(ScrollPos2 < mythiellTop){
	  $('.mythiell-ad').addClass('mythiell-up');
	  $('.mythiell-ad').removeClass('mythiell-down');
	  $('.mythiell-logo.top').removeClass('mythiell-logo-fixed');
	  if (!showMid)
	  {
		// log
		console.log('mid ad loaded');
		showMid = true
	  }
	}

	if(scrolllogo > mythiellTop){
	  $('.mythiell-logo.top').addClass('mythiell-logo-fixed');
	}
	if(scrolllogo > scrollbot+logoheight){
	  $('.mythiell-logo.top').removeClass('mythiell-logo-fixed');
	}
  }
} catch (e) {
}
//          console.log(mythiellFullHeight + fullAdHeight, ScrollPos)

  if (!showFull && mythiellFullHeight + fullAdHeight <= ScrollPos )
  {
	console.log('full ad loaded')
	showFull = true;
  }
  
});


