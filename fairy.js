/**
 * 마이트립(My Trip) - 요정 모아 성장 시스템
 * 생일(계절)과 마을별 진행도에 따라 모아의 외형을 결정합니다.
 */

window.MY_TRIP_FAIRY = {
  // 계절 정의 및 정보
  seasons: {
    spring: {
      id: 'spring',
      name: '봄',
      months: [3, 4, 5],
      deco: '분홍색 꽃 장식',
      themeColor: '#FFB6C1',
      eggImage: 'assets/moa/egg_spring.png',
      finalImage: 'assets/moa/final_spring.png'
    },
    summer: {
      id: 'summer',
      name: '여름',
      months: [6, 7, 8],
      deco: '초록색 잎 장식',
      themeColor: '#A8E6CF',
      eggImage: 'assets/moa/egg_summer.png',
      finalImage: 'assets/moa/final_summer.png'
    },
    autumn: {
      id: 'autumn',
      name: '가을',
      months: [9, 10, 11],
      deco: '노란색 은행잎 장식',
      themeColor: '#FFEAA7',
      eggImage: 'assets/moa/egg_autumn.png',
      finalImage: 'assets/moa/final_autumn.png'
    },
    winter: {
      id: 'winter',
      name: '겨울',
      months: [12, 1, 2],
      deco: '파란색 눈꽃 장식',
      themeColor: '#DFF9FB',
      eggImage: 'assets/moa/egg_winter.png',
      finalImage: 'assets/moa/final_winter.png'
    }
  },

  // 월(1~12)로 계절 찾기
  getSeasonFromMonth: function(month) {
    var m = parseInt(month, 10);
    if (m >= 3 && m <= 5) return 'spring';
    if (m >= 6 && m <= 8) return 'summer';
    if (m >= 9 && m <= 11) return 'autumn';
    return 'winter';
  },

  // 나 마을 성장 단계 (진도율 0% ~ 100%)
  meGrowthStages: [
    { threshold: 0, percent: 0, image: 'assets/moa/me_0.png', name: '알 상태', desc: '아직 깨어나지 않은 조용한 알이에요.' },
    { threshold: 2, percent: 25, image: 'assets/moa/me_25.png', name: '금이 간 알', desc: '알에 작은 금이 가며 안에서 소리가 들려요!' },
    { threshold: 5, percent: 50, image: 'assets/moa/me_50.png', name: '더 깨진 알', desc: '알 껍질이 더 깨지며 모아가 나올 준비를 해요!' },
    { threshold: 7, percent: 75, image: 'assets/moa/me_75.png', name: '부화 중인 모아', desc: '알 껍질을 쏙 벗고 모아가 세상 밖으로 고개를 내밀었어요!' },
    { threshold: 10, percent: 100, image: 'assets/moa/me_100.png', name: '모아 탄생 완료', desc: '사랑스러운 요정 모아가 건강하게 태어났어요!' }
  ],

  // 마을별 소품 이미지 (원본 기획서 디자인 기준)
  // [알림] 원본 참고 이미지(moa-growth.png)에는 봄(분홍 모아) 기준 소품만 포함되어 있습니다.
  // 추후 여름/가을/겨울 테마 소품 이미지가 추가되면 해당 경로로 교체할 수 있도록 확장 경로를 지원합니다.
  villageProps: {
    family: {
      name: '풍선을 든 모아',
      desc: '가족과의 따뜻한 추억을 담은 빨간 풍선을 들고 있어요.',
      defaultImage: 'assets/moa/prop_family.png',
      seasonImages: {
        spring: 'assets/moa/prop_family.png'
        // summer, autumn, winter 이미지가 추가되면 여기에 파일명을 등록하면 됩니다.
      }
    },
    friend: {
      name: '안경과 연필을 든 모아',
      desc: '친구들과의 즐거운 배움과 우정을 기록하는 필기구와 안경을 착용했어요.',
      defaultImage: 'assets/moa/prop_friend.png',
      seasonImages: {
        spring: 'assets/moa/prop_friend.png'
      }
    },
    community: {
      name: '돋보기와 지구본을 든 모아',
      desc: '내가 사는 세상과 넓은 지구를 탐색하기 위한 돋보기와 지구본을 들었어요.',
      defaultImage: 'assets/moa/prop_community.png',
      seasonImages: {
        spring: 'assets/moa/prop_community.png'
      }
    },
    career: {
      name: '나침반과 보타이를 한 모아',
      desc: '나만의 멋진 미래와 꿈을 찾아 나아가는 든든한 나침반을 들고 보타이를 맸어요.',
      defaultImage: 'assets/moa/prop_career.png',
      seasonImages: {
        spring: 'assets/moa/prop_career.png'
      }
    }
  },

  /**
   * 현재 사용자의 상태(계절, 마을, 나 마을 완료 수, 전체 완주 여부)에 따른
   * 모아의 대표 이미지, 상태 이름, 설명을 반환합니다.
   */
  getCurrentMoaStatus: function(userData) {
    var seasonKey = userData.season || 'spring';
    var seasonInfo = this.seasons[seasonKey] || this.seasons.spring;
    var currentVillage = userData.currentVillage || 'me';
    var meCompletedCount = userData.meCompletedCount || 0;
    var isAllCompleted = userData.isAllCompleted || false;

    // 1. 전체 5개 마을(50개 질문) 완주 상태
    if (isAllCompleted) {
      return {
        stageType: 'final',
        image: seasonInfo.finalImage,
        name: seasonInfo.name + ' 테마 완성 모아',
        desc: '모든 여행을 마치고 완벽하게 성장한 나만의 ' + seasonInfo.name + ' 요정 모아예요!',
        season: seasonInfo
      };
    }

    // 2. 1번째 마을: 나 마을 진행 중 (알 부화 단계)
    if (currentVillage === 'me') {
      // 0개 완료 시: 계절 알
      if (meCompletedCount === 0) {
        return {
          stageType: 'egg',
          image: seasonInfo.eggImage,
          name: seasonInfo.name + '의 알 (' + seasonInfo.deco + ')',
          desc: '따뜻한 온기를 품고 있는 ' + seasonInfo.name + '의 알이에요. 질문에 답할수록 모아가 깨어납니다.',
          season: seasonInfo,
          percent: 0
        };
      }
      // 1~10개 완료 단계
      var chosenStage = this.meGrowthStages[0];
      for (var i = 0; i < this.meGrowthStages.length; i++) {
        if (meCompletedCount >= this.meGrowthStages[i].threshold) {
          chosenStage = this.meGrowthStages[i];
        }
      }
      return {
        stageType: 'me_growth',
        image: chosenStage.image,
        name: chosenStage.name,
        desc: chosenStage.desc,
        percent: chosenStage.percent,
        season: seasonInfo
      };
    }

    // 3. 2~5번째 마을: 가족, 친구, 지역사회, 진로 마을 진행 중 (소품 모아)
    var propInfo = this.villageProps[currentVillage];
    if (propInfo) {
      var img = (propInfo.seasonImages && propInfo.seasonImages[seasonKey]) 
                ? propInfo.seasonImages[seasonKey] 
                : propInfo.defaultImage;
      return {
        stageType: 'prop',
        image: img,
        name: propInfo.name,
        desc: propInfo.desc,
        season: seasonInfo
      };
    }

    // 기본 fallback
    return {
      stageType: 'default',
      image: 'assets/moa/me_100.png',
      name: '요정 모아',
      desc: '함께 여행하는 귀여운 정체성 요정 모아입니다.',
      season: seasonInfo
    };
  }
};

