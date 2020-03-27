document.writeln('<link type="text/css" href="http://admaster.kode.co.kr/adsrc/scrollad-mid.css" rel="stylesheet" />');

document.writeln('	<span role="action"></span>');
document.writeln('	<span role="midshowcheck"></span>');
document.writeln('	<span role="ScrollPos"></span>');
document.writeln('	<span role="ScrollPos2"></span>');
document.writeln('	<span role="mythiellStartPoint"></span>');
document.writeln('	<section class="mythiell-mid" style="height:280px">');        
document.writeln('		<div class="mythiell-wrap-mid" style="height:280px">');
document.writeln('			<div class="mythiell-ad" style="width:336px;height:280px; border:1px solid #000;">');
document.writeln('            <scri'+'pt type="text/javascript" src="//tm.interworksmedia.co.kr/ads.js/5A38DE9D"></scri'+'pt>'); // 이 부분에 광고 스크립트 들어가야 함

document.writeln('              <div class="mythiell-logo top left">');
document.writeln('                <div><img src="http://admaster.kode.co.kr/adsrc/logo.png" alt="mythiell"/></div>');
document.writeln('                </div>');

document.writeln('			</div>');       
document.writeln('		</div>');
document.writeln('	</section>');
document.writeln('	<span role="action2"></span>');







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
var fullAdHeight = 280;

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
  var ScrollPos2 = parseInt(DocHeight+DocTop);
  //광고 기준 좌표
  var mythielladTop = $('.mythiell-mid').offset().top;
  //광고 높이
  var mythiellHeight = $('.mythiell-mid').height();
  var mythiellStartPoint = parseInt(mythielladTop+mythiellHeight); 
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
	$("span[role='action']").html("up");
	$("span[role='ScrollPos']").html(ScrollPos);
	$("span[role='ScrollPos2']").html(ScrollPos2);
	$("span[role='mythiellStartPoint']").html(mythiellStartPoint);
	if(ScrollPos-64 > mythiellStartPoint){
	  $("span[role='midshowcheck']").html("show");
	  $('.mythiell-ad').addClass('mythiell-up');
	  
	}else if(ScrollPos-64 < mythiellStartPoint){
	  $("span[role='midshowcheck']").html("");
	  $('.mythiell-ad').removeClass('mythiell-up');
	}
  }else if(mythielladTop < mythiellfunction){
	$("span[role='action']").html("down");
	//내릴때            
	if(ScrollPos2 > mythiellTop){
	  $("span[role='action2']").html("1");
	  $('.mythiell-ad').removeClass('mythiell-up');
	  $('.mythiell-ad').addClass('mythiell-down'); 
	}else if(ScrollPos2 < mythiellTop){
	  $("span[role='action2']").html("2");
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


