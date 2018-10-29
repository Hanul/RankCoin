global.Contract2Object = CLASS((cls) => {
	
	let isWeb3Enable = false;
	
	// Web3 체크
	if (typeof global.web3 !== 'undefined') {
		global.web3 = new Web3(global.web3.currentProvider);
		isWeb3Enable = true;
	}
	
	let checkIsWeb3Enable = cls.checkIsWeb3Enable = () => {
		return isWeb3Enable;
	};
	
	return {
		
		init : (inner, self, params) => {
			//REQUIRED: params
			//REQUIRED: params.abi
			//REQUIRED: params.address
			
			let abi = params.abi;
			let address = params.address;
			
			let getAddress = self.getAddress = () => {
				return address;
			};
			
			let eventMap = {};
			
			let contract;
			if (checkIsWeb3Enable() === true) {
				
				contract = web3.eth.contract(abi).at(address);
				
				// 계약의 이벤트 핸들링
				contract.allEvents((error, info) => {
					
					if (error === TO_DELETE) {
						
						let eventHandlers = eventMap[info.event];
						
						if (eventHandlers !== undefined) {
							EACH(eventHandlers, (eventHandler) => {
								eventHandler(info.args);
							});
						}
					}
				});
			}
			
			// 함수 분석 및 생성
			EACH(abi, (funcInfo) => {
				if (funcInfo.type === 'function') {
					
					self[funcInfo.name] = (params, callbackOrHandlers) => {
						
						// 콜백만 입력된 경우
						if (callbackOrHandlers === undefined) {
							callbackOrHandlers = params;
							params = undefined;
						}
						
						let callback;
						let transactionAddressCallback;
						let errorHandler;
						
						// 콜백 정리
						if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
							callback = callbackOrHandlers;
						} else {
							callback = callbackOrHandlers.success;
							transactionAddressCallback = callbackOrHandlers.transactionAddress;
							errorHandler = callbackOrHandlers.error;
						}
						
						let args = [];
						
						// 파라미터가 없거나 1개인 경우
						if (funcInfo.inputs.length <= 1) {
							args.push(params);
						}
						
						// 파라미터가 여러개인 경우
						else if (funcInfo.inputs.length > 1) {
							EACH(funcInfo.inputs, (input) => {
								args.push(params[input.name]);
							});
						}
						
						// 이더 추가
						if (funcInfo.payable === true) {
							args.push(web3.toWei(params.ether, 'ether'));
						}
						
						// 콜백 추가
						args.push((error, result) => {
							
							// 계약 실행 오류 발생
							if (error !== TO_DELETE) {
								if (errorHandler !== undefined) {
									errorHandler(error.toString());
								} else {
									SHOW_ERROR(funcInfo.name, error.toString(), params);
								}
							}
							
							// 정상 작동
							else {
								
								// constant 함수인 경우
								if (funcInfo.constant === true) {
									
									if (callback !== undefined) {
										
										// output이 없는 경우
										if (funcInfo.outputs.length === 0) {
											callback();
										}
										
										// output이 1개인 경우
										else if (funcInfo.outputs.length === 1) {
											if (funcInfo.outputs[0].type === 'string') {
												callback(result.toString(10));
											} else if (result.toNumber !== undefined) {
												callback(result.toNumber(), result.toString(10));
											} else {
												callback(result);
											}
										}
										
										// output이 여러개인 경우
										else if (funcInfo.outputs.length > 1) {
											
											EACH(funcInfo.outputs, (output, i) => {
												if (output.type === 'string') {
													result[i] = result[i].toString(10);
												} else if (result.toNumber !== undefined) {
													result[i] = result[i].toNumber();
												}
											});
											
											EACH(funcInfo.outputs, (output, i) => {
												if (output.type !== 'string' && result.toNumber !== undefined) {
													result.push(result[i].toString(10));
												}
											});
											
											callback.apply(result);
										}
									}
								}
								
								// 트랜잭션이 필요한 함수인 경우
								else {
									
									if (transactionAddressCallback !== undefined) {
										transactionAddressCallback(result);
									}
									
									if (callback !== undefined) {
										
										let retry = RAR(() => {
											
											web3.eth.getTransactionReceipt(result, (error, result) => {
												
												// 트랜잭선 오류 발생
												if (error !== TO_DELETE) {
													if (errorHandler !== undefined) {
														errorHandler(error.toString());
													} else {
														SHOW_ERROR(funcInfo.name, error.toString(), params);
													}
												}
												
												// 아무런 값이 없으면 재시도
												else if (result === TO_DELETE) {
													retry();
												}
												
												// 트랜잭션 완료
												else {
													callback();
												}
											});
										});
									}
								}
							}
						});
						
						contract[funcInfo.name].apply(contract, args);
					};
				}
			});
			
			// 이벤트 핸들러를 등록합니다.
			let on = self.on = (eventName, eventHandler) => {
				//REQUIRED: eventName
				//REQUIRED: eventHandler
				
				if (eventMap[eventName] === undefined) {
					eventMap[eventName] = [];
				}
	
				eventMap[eventName].push(eventHandler);
			};
			
			// 이벤트 핸들러를 제거합니다.
			let off = self.off = (eventName, eventHandler) => {
				//REQUIRED: eventName
				//OPTIONAL: eventHandler
	
				if (eventMap[eventName] !== undefined) {
	
					if (eventHandler !== undefined) {
	
						REMOVE({
							array: eventMap[eventName],
							value: eventHandler
						});
					}
	
					if (eventHandler === undefined || eventMap[eventName].length === 0) {
						delete eventMap[eventName];
					}
				}
			};
		}
	};
});