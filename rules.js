/**
 * 마이트립(My Trip) - 마을 진행 및 시스템 규칙
 * 코딩에 익숙하지 않아도 여기서 마을 규칙, 보상, 안내 문구를 쉽게 수정할 수 있습니다.
 */

window.MY_TRIP_RULES = {
  // 1. 마을 진행 순서 및 설정
  villageOrder: ['me', 'family', 'friend', 'community', 'career'],
  
  villageMeta: {
    me: {
      id: 'me',
      name: '나 마을',
      number: 1,
      requiredCount: 10,
      description: '나를 돌아보고 알아가기',
      color: '#4CAF50',
      propName: '알 부화 단계'
    },
    family: {
      id: 'family',
      name: '가족 마을',
      number: 2,
      requiredCount: 10,
      description: '우리 가족과 소중한 추억',
      color: '#FFA726',
      propName: '풍선을 든 모아'
    },
    friend: {
      id: 'friend',
      name: '친구 마을',
      number: 3,
      requiredCount: 10,
      description: '친구와의 관계와 소중한 우정',
      color: '#29B6F6',
      propName: '안경과 연필, 책을 든 모아'
    },
    community: {
      id: 'community',
      name: '지역사회 마을',
      number: 4,
      requiredCount: 10,
      description: '내가 살아가는 세상과 두 문화',
      color: '#AB47BC',
      propName: '돋보기와 지구본을 든 모아'
    },
    career: {
      id: 'career',
      name: '진로 마을',
      number: 5,
      requiredCount: 10,
      description: '나의 꿈과 멋진 미래',
      color: '#EF5350',
      propName: '나침반과 보타이를 한 모아'
    }
  },

  // 2. 질문 진행 규칙
  questions: {
    villageQuestionCount: 10, // 마을당 질문 수
    dailyRecommended: 2,      // 하루 기본 권장 질문 수
    allowUnlimitedDaily: true // 하루 2개 제한 없이 열린 마을 질문 계속 진행 가능 여부
  },

  // 3. 보상 및 게이미피케이션 규칙 (기획서 기준)
  rewards: {
    questionCompleteCoins: 50,  // 질문 답변 1회당 50코인
    questionCompleteFuel: 100,  // 질문 1개당 기름 100% 주유
    maxFuel: 100,               // 기름 최대치
    dailyLoginCoins: 20,        // 출석 체크 20코인
    driveFuelCost: 20           // 운전 1회 플레이당 기름 20% 소모
  },

  // 4. 기획서 16페이지 원문 안내 문구
  messages: {
    welcomeDaily: "오늘도 새로운 여정을 떠나볼까요?",
    fuelGained: "질문 완수! 여행을 위한 기름 100L가 충전되었습니다.",
    fairyHatched: "축하합니다! 나의 마음이 담긴 정체성 요정이 태어났어요!",
    dailyGoalReached: "오늘 풀 수 있는 질문(2개)을 모두 완료했어요! 모은 기름으로 드라이빙을 즐기거나 차고를 꾸며보세요.",
    lockedVillage: "아직 이전 마을의 질문을 모두 완료하지 않았어요. 이전 마을을 먼저 완주해주세요!",
    villageCompleted: "마을의 모든 질문을 완주했어요! 다음 마을의 문이 열렸습니다!",
    allJourneyCompleted: "축하합니다! 5개 마을의 모든 여정을 완주했습니다! 마지막 마무리 질문을 확인해보세요."
  }
};

