import React, { useState, useEffect } from "react";
import "./App.css";
import {
	GoogleGenerativeAI,
	HarmCategory,
	HarmBlockThreshold,
} from "@google/generative-ai";
import {
	Box,
	Heading,
	Text,
	Input,
	Textarea,
	Select,
	Button,
	IconButton,
	Badge,
	Flex,
	Center,
	SimpleGrid,
	Spinner,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	useDisclosure,
	Tag,
	TagLabel,
	TagLeftIcon,
	TagRightIcon,
	TagCloseButton,
} from "@chakra-ui/react";
import { AddIcon, CopyIcon } from "@chakra-ui/icons";
import Mark from "react-mark-ii";

const App = () => {
	const [chatHistory, setChatHistory] = useState([]);
	const [loadingResponse, setLoadingResponse] = useState(false);
	const { isOpen, onOpen, onClose } = useDisclosure();

	const [userInput, setUserInput] = useState("");
	const [ticketType, setTicketType] = useState("feature");
	const [keyword, setKeyword] = useState("");

	// -------------------------------------------------------------------

	// TODO: move logic to initalize a the ai api
	const MODEL_NAME = "gemini-1.0-pro";
	const API_KEY = "AIzaSyD86Cj2IIYWYAvFvcgD5nFuDNyULq72zl4";

	const genAI = new GoogleGenerativeAI(API_KEY);
	const model = genAI.getGenerativeModel({ model: MODEL_NAME });

	const generationConfig = {
		temperature: 0.9,
		topK: 1,
		topP: 1,
		maxOutputTokens: 2048,
	};

	const safetySettings = [
		{
			category: HarmCategory.HARM_CATEGORY_HARASSMENT,
			threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
		},
		{
			category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
			threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
		},
		{
			category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
			threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
		},
		{
			category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
			threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
		},
	];

	const chat = model.startChat({
		generationConfig,
		safetySettings,
		history: [],
	});

	const sendInitialMessage = async () => {
		setLoadingResponse(true);
		const result = await chat.sendMessage("Hello, how can I help you today?");
		const response = result.response;
		setChatHistory([
			{
				role: "model",
				text: response.text(),
			},
		]);
		setLoadingResponse(false);
	};

	// -------------------------------------------------------------------

	// useEffect(() => {
	// 	sendInitialMessage();
	// }, []);

	const onUserInput = (event) => {
		setUserInput(event.target.value);
	};

	const onTicketTypeSelected = (event) => {
		setTicketType(event.target.value);
	};

	const onGenerate = async () => {
		if (userInput === "") return;

		let prompt = "";
		if (ticketType === "feature") {
			prompt = `I need to create a jira ticket for a feature with a title,description, acceptance criteria and use cases with the Given-When-Then (Gherkin) system, regarding: ${userInput}`;
		} else {
			prompt = `I need to create a jira ticket for a bug with title, description, steps to reproduce, expected behaviour and actual behaviour, regarding: ${userInput}`;
		}

		setLoadingResponse(true);
		const chatHistoryCopy = [...chatHistory];
		chatHistoryCopy.push({
			role: "user",
			text: userInput,
		});

		const result = await chat.sendMessage(prompt);
		const response = result.response;
		const newMessage = {
			role: "model",
			text: response.text(),
		};
		setChatHistory([...chatHistoryCopy, newMessage]);
		setUserInput("");
		setLoadingResponse(false);
	};

	// -------------------------------------------------------------------

	const str = "*bold* _emphasis_ ~strike~ `code` ```code\nblock```";

	const options = {
		"**": { renderer: "h2" },
		_: { renderer: "u" },
		"~": {
			renderer: ({ children }) => <span className="red">{children}</span>,
		},
		"`": { renderer: "kbd", raw: true },
		"```": { renderer: "pre", raw: true, multiline: true, alwaysOpen: true },
	};

	// -------------------------------------------------------------------

	return (
		<>
			<div className="board">
				<Box py="10" px="8" bg="#eaeaea5e">
					<Flex mb="4">
						<Heading as="h2" size="lg" mr="3">
							Context
						</Heading>
						<IconButton
							aria-label="Search database"
							icon={<AddIcon />}
							onClick={onOpen}
						/>
					</Flex>
					<Tag variant="solid" size="lg" borderRadius="full">
						Guide
					</Tag>
				</Box>
				<Box py="10" px="8">
					<Heading as="h1" mb="8">
						Let's get your ticket description ready
					</Heading>
					<Box>
						<Flex mb="4">
							<Select
								value={ticketType}
								onChange={onTicketTypeSelected}
								size="lg"
								w="180px"
								focusBorderColor="gray.300"
							>
								<option value="feature">✨ Feature</option>
								<option value="bug">🐛 Bug</option>
							</Select>
							<Input
								id="prompt"
								value={userInput}
								onChange={onUserInput}
								placeholder="What is needed?"
								size="lg"
								focusBorderColor="gray.300"
							/>
						</Flex>
						<Button onClick={onGenerate} colorScheme="teal" size="lg">
							Generate
						</Button>
					</Box>
					<Box mt="10">
						{/* <Mark>{str}</Mark> */}
						<Box boxShadow="xl" p="10" rounded="md" bg="white">
							{loadingResponse ? (
								<Center>
									<Spinner
										thickness="4px"
										speed="0.65s"
										emptyColor="gray.200"
										color="teal.500"
										size="xl"
									/>
								</Center>
							) : (
								!!chatHistory.length && (
									<>
										<Flex justify="flex-end">
											<Button leftIcon={<CopyIcon />} colorScheme="gray" mb="3">
												Copy
											</Button>
										</Flex>
										<Mark options={options} className="result">
											{chatHistory[chatHistory.length - 1].text}
										</Mark>
									</>
								)
							)}
						</Box>
					</Box>
				</Box>
			</div>

			<Modal blockScrollOnMount={false} isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Add context of your business</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Box py="3">
							<Input
								id="keyword"
								value={keyword}
								placeholder="Keyword"
								size="lg"
								mb="3"
								focusBorderColor="gray.300"
							/>
							<Textarea
								placeholder="Explain what does the keyword means in the context of your business"
								size="lg"
								mb="3"
								focusBorderColor="gray.300"
							/>
						</Box>
					</ModalBody>

					<ModalFooter>
						<Button variant="ghost" mr={3} onClick={onClose}>
							Close
						</Button>
						<Button colorScheme="teal">Add</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default App;
