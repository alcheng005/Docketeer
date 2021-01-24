import notificationReducer from '../src/reducers/notificationReducer.js';

// invoke describe with string and callback
describe('notifcationReducer', () => {
  let startState;
  const fakeAction = {type: 'TEST_ACTION'};

  beforeEach(() => {
    startState = {
      phoneNumber: "+15556789",
      memoryNotificationList: new Set(['411e81584ee7', '79fc579a5b32', '7f421d415b68']),
      cpuNotificationList: new Set(['79fc579a5b32']),
      stoppedNotificationList: new Set(['7f421d415b68']),
    };
  });

  it('should provide a default state', () => {
    // arrange
    let expected = {
      phoneNumber: '',
      memoryNotificationList: new Set(),
      cpuNotificationList: new Set(),
      stoppedNotificationList: new Set()
    }

    // act
    const result = notificationReducer(undefined, fakeAction);

    // assert
    expect(result).toStrictEqual(expected);

  });

  it('should return same state if action not valid', () => {
    // act
    const result = notificationReducer(startState, fakeAction);
    // assert
    expect(result).toBe(startState);
  })

  describe('ADD_PHONE_NUMBER', () => {
    let action;

    beforeEach(() => {
      action = {
        type: 'ADD_PHONE_NUMBER',
        payload: '+13334567'
      };
    });

    it('should replace existing phone number', () => {
      // act
      const result = notificationReducer(startState, action);
      // assert
      expect(result).toHaveProperty('phoneNumber', '+13334567');
    });
  });

  describe('ADD_MEMORY_NOTIFICATION_SETTING', () => {
    let action;

    beforeEach(() => {
      action = {
        type: 'ADD_MEMORY_NOTIFICATION_SETTING',
        payload: ['411e81584ee7', '79fc579a5b32', '7f421d415b68']
      };
    });

    it('should set array payload as memory notification setting Set', () => {
      // act
      const result = notificationReducer(startState, action);
      // assert
      expect(result).toHaveProperty('memoryNotificationList', new Set(action.payload));
    });
  });

  describe('ADD_CPU_NOTIFICATION_SETTING', () => {
    let action;

    beforeEach(() => {
      action = {
        type: 'ADD_CPU_NOTIFICATION_SETTING',
        payload: ['7f421d415b68']
      };
    });

    it('should set array payload as cpu notification setting Set', () => {
      // act
      const result = notificationReducer(startState, action);
      // assert
      expect(result).toHaveProperty('cpuNotificationList', new Set(action.payload));
    });
  });

  describe('ADD_STOPPED_NOTIFICATION_SETTING', () => {
    let action;

    beforeEach(() => {
      action = {
        type: 'ADD_STOPPED_NOTIFICATION_SETTING',
        payload: ['79fc579a5b32']
      };
    });

    it('should set array payload as stopped notification setting Set', () => {
      // act
      const result = notificationReducer(startState, action);
      // assert
      expect(result).toHaveProperty('stoppedNotificationList', new Set(action.payload));
    });

    it('should set empty stopped notification setting Set', () => {
      // arrange
      action = {...action, payload: []};
      // act
      const result = notificationReducer(startState, action);
      // assert
      expect(result).toHaveProperty('stoppedNotificationList', new Set([]));
    });
  });

})
