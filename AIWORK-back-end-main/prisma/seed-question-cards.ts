import { PrismaClient, QuestionType, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface QuestionCardSeed {
	slug: string;
	orderIndex: number;
	title: string;
	subtitle?: string;
	question: string;
	type: QuestionType;
	options?: { value: string; label: string }[];
	config?: Record<string, unknown>;
}

const questionCards: QuestionCardSeed[] = [
	// ============================================
	// CARD 5A — Founder / Solo Builder
	// ============================================
	{
		slug: 'founder-work-type',
		orderIndex: 500,
		title: 'Your Focus',
		subtitle: 'Founder Work',
		question: 'What kind of founder work are you doing most right now?',
		type: 'SINGLE_SELECT',
		options: [
			{ value: 'deciding', label: 'Deciding what to build, cut, or delay' },
			{ value: 'leading', label: 'Leading or managing a small team' },
			{ value: 'executing', label: 'Doing hands-on execution myself' },
			{ value: 'juggling', label: 'Juggling everything as it comes up' },
		],
		config: {
			showWhen: { role: 'founder' },
			category: 'role-specific',
		},
	},
	{
		slug: 'founder-business-type',
		orderIndex: 501,
		title: 'Business Type',
		subtitle: 'Founder Context',
		question: 'What kind of business are you building?',
		type: 'SINGLE_SELECT',
		options: [
			{ value: 'software', label: 'Software / SaaS / AI' },
			{ value: 'ecommerce', label: 'Ecommerce / Physical product' },
			{ value: 'services', label: 'Services / Agency / Consulting' },
			{ value: 'marketplace', label: 'Marketplace / Platform' },
			{ value: 'other', label: 'Other' },
		],
		config: {
			showWhen: { role: 'founder' },
			category: 'role-specific',
		},
	},

	// ============================================
	// CARD 5B — Fractional / Strategic Operator
	// ============================================
	{
		slug: 'fractional-role-type',
		orderIndex: 510,
		title: 'Your Role',
		subtitle: 'Fractional Work',
		question: 'Which role are you primarily playing right now?',
		type: 'SINGLE_SELECT',
		options: [
			{ value: 'coo', label: 'Fractional COO / Operations' },
			{ value: 'cto', label: 'Fractional CTO / Engineering' },
			{ value: 'cfo', label: 'Fractional CFO / Finance' },
			{ value: 'cmo', label: 'Fractional CMO / Growth' },
			{ value: 'mixed', label: 'Mixed — varies by client' },
		],
		config: {
			showWhen: { role: 'fractional' },
			category: 'role-specific',
		},
	},

	// ============================================
	// CARD 5C — Sales / Revenue
	// ============================================
	{
		slug: 'sales-work-type',
		orderIndex: 520,
		title: 'Sales Focus',
		subtitle: 'Revenue Work',
		question: 'What kind of sales work is taking most of your time?',
		type: 'SINGLE_SELECT',
		options: [
			{ value: 'prospecting', label: 'Prospecting / pipeline building' },
			{ value: 'closing', label: 'Active deals / closing' },
			{ value: 'account-mgmt', label: 'Account management / renewals' },
			{ value: 'sales-ops', label: 'Sales ops / enablement' },
		],
		config: {
			showWhen: { role: 'sales' },
			category: 'role-specific',
		},
	},

	// ============================================
	// CARD 5D — Product / Engineering
	// ============================================
	{
		slug: 'product-eng-work-type',
		orderIndex: 530,
		title: 'Product Focus',
		subtitle: 'Engineering Work',
		question: 'What kind of product or engineering work are you focused on?',
		type: 'SINGLE_SELECT',
		options: [
			{ value: 'shipping', label: 'Shipping or stabilizing features' },
			{ value: 'reviewing', label: 'Reviewing designs or technical decisions' },
			{ value: 'fixing', label: 'Fixing bugs or reliability issues' },
			{ value: 'planning', label: 'Planning roadmap or architecture' },
		],
		config: {
			showWhen: { role: 'product-engineering' },
			category: 'role-specific',
		},
	},

	// ============================================
	// CARD 5E — Marketing / Growth
	// ============================================
	{
		slug: 'marketing-work-type',
		orderIndex: 540,
		title: 'Marketing Focus',
		subtitle: 'Growth Work',
		question: 'What kind of marketing work are you focused on?',
		type: 'SINGLE_SELECT',
		options: [
			{ value: 'launching', label: 'Launching or executing campaigns' },
			{ value: 'analyzing', label: "Reviewing performance / fixing what's not working" },
			{ value: 'strategy', label: 'Messaging, positioning, or strategy' },
			{ value: 'systems', label: 'Systems, tooling, or ops cleanup' },
		],
		config: {
			showWhen: { role: 'marketing' },
			category: 'role-specific',
		},
	},

	// ============================================
	// CARD 5F — Other
	// ============================================
	{
		slug: 'other-work-type',
		orderIndex: 550,
		title: 'Your Focus',
		subtitle: 'Work Type',
		question: "Which of these is closest to what you're doing?",
		type: 'SINGLE_SELECT',
		options: [
			{ value: 'operations', label: 'Operations / execution' },
			{ value: 'technical', label: 'Technical / product' },
			{ value: 'revenue', label: 'Revenue / growth' },
			{ value: 'support', label: 'General support / admin' },
		],
		config: {
			showWhen: { role: 'other' },
			category: 'role-specific',
		},
	},

	// ============================================
	// CARD 6 — Seniority / Depth
	// ============================================
	{
		slug: 'seniority-depth',
		orderIndex: 600,
		title: 'Decision Load',
		subtitle: 'Seniority',
		question: 'How often does work depend on your judgment this week?',
		type: 'SINGLE_SELECT',
		options: [
			{ value: 'most-decisions', label: 'Most decisions run through me' },
			{ value: 'key-calls', label: 'I make key calls, but others execute' },
			{ value: 'mostly-execute', label: "I mostly execute work that's already decided" },
		],
		config: {
			category: 'context',
			infersSeniority: true,
		},
	},

	// ============================================
	// CARD 7 — Pressure + Human Context
	// ============================================
	{
		slug: 'weekly-pressure',
		orderIndex: 700,
		title: 'Pressure Point',
		subtitle: 'Pain Routing',
		question: "What's putting the most pressure on your week right now?",
		type: 'SINGLE_SELECT',
		options: [
			{ value: 'overcommit', label: 'I overcommit and pay for it later' },
			{ value: 'urgent-hijack', label: 'New urgent work hijacks my plans' },
			{ value: 'estimates-off', label: 'My estimates are off — things take longer' },
			{ value: 'too-many-projects', label: 'Too many projects or clients at once' },
			{ value: 'finish-right-things', label: 'I need to finish the right things, not more things' },
			{ value: 'context-switching', label: 'Context switching is killing my focus' },
		],
		config: {
			category: 'context',
		},
	},

	// ============================================
	// CARD 8 — Life Context
	// ============================================
	{
		slug: 'life-context',
		orderIndex: 800,
		title: 'Life Balance',
		subtitle: 'Personal Time',
		question: 'Outside of work, what still needs time this week?',
		type: 'SINGLE_SELECT',
		options: [
			{ value: 'sleep', label: 'Sleep & recovery' },
			{ value: 'health', label: 'Health / fitness' },
			{ value: 'family', label: 'Family / relationships' },
			{ value: 'home', label: 'Home & life admin' },
			{ value: 'errands', label: 'Errands / personal tasks' },
		],
		config: {
			category: 'context',
		},
	},

	// ============================================
	// CARD 9 — Weekly Gravity + Input
	// ============================================
	{
		slug: 'weekly-effort-focus',
		orderIndex: 900,
		title: 'Effort Allocation',
		subtitle: 'Weekly Gravity',
		question: 'Where will most of your effort likely go this week? (Pick up to 2)',
		type: 'MULTI_SELECT',
		options: [
			{ value: 'build-ship', label: 'Build / Ship product' },
			{ value: 'sales', label: 'Close deals / Prospect' },
			{ value: 'marketing', label: 'Marketing / Audience growth' },
			{ value: 'client-delivery', label: 'Client delivery / Retention' },
			{ value: 'operations', label: 'Operations / Internal systems' },
			{ value: 'hiring', label: 'Hiring / Team progress' },
			{ value: 'strategy', label: 'Strategy / Planning' },
			{ value: 'other', label: 'Other' },
		],
		config: {
			category: 'planning',
			maxSelections: 2,
		},
	},

	// ============================================
	// CARD 10 — Free Text (Top of Mind)
	// ============================================
	{
		slug: 'top-of-mind',
		orderIndex: 1000,
		title: 'Brain Dump',
		subtitle: 'Free Input',
		question: "Write anything that's top of mind about this week.\nMessy is fine. One word is fine. You can skip.",
		type: 'TEXT_INPUT',
		config: {
			category: 'input',
			optional: true,
			placeholder: "What's on your mind this week?",
			maxLength: 1000,
		},
	},

	// ============================================
	// CARD 11 — Free Text (Blocker)
	// ============================================
	{
		slug: 'weekly-blocker',
		orderIndex: 1100,
		title: 'Anticipated Blocker',
		subtitle: 'Obstacle',
		question: "Optional — What's one thing that will get in the way this week?",
		type: 'TEXT_INPUT',
		config: {
			category: 'input',
			optional: true,
			placeholder: 'What might slow you down?',
			maxLength: 500,
		},
	},
];

async function main() {
	console.log('Seeding QuestionCard data...\n');

	for (const card of questionCards) {
		const existing = await prisma.questionCard.findUnique({
			where: { slug: card.slug },
		});

		if (existing) {
			// Update existing card
			await prisma.questionCard.update({
				where: { slug: card.slug },
				data: {
					orderIndex: card.orderIndex,
					title: card.title,
					subtitle: card.subtitle,
					question: card.question,
					type: card.type,
					options: (card.options as Prisma.InputJsonValue) || Prisma.JsonNull,
					config: (card.config as Prisma.InputJsonValue) || Prisma.JsonNull,
				},
			});
			console.log(`  Updated: ${card.slug}`);
		} else {
			// Create new card
			await prisma.questionCard.create({
				data: {
					slug: card.slug,
					orderIndex: card.orderIndex,
					title: card.title,
					subtitle: card.subtitle,
					question: card.question,
					type: card.type,
					options: (card.options as Prisma.InputJsonValue) || Prisma.JsonNull,
					config: (card.config as Prisma.InputJsonValue) || Prisma.JsonNull,
				},
			});
			console.log(`  Created: ${card.slug}`);
		}
	}

	const count = await prisma.questionCard.count();
	console.log(`\n--- Seed Complete ---`);
	console.log(`Total QuestionCards: ${count}`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
