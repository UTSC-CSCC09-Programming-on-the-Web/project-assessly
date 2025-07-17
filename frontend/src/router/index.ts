import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: 'Home',
		component: () => import('@/views/HomeView.vue'),
		meta: {
			title: 'Home - Assessly',
		},
	},
	{
		path: '/candidate-dashboard',
		name: 'CandidateDashboard',
		component: () => import('@/views/candidate-views/CandidateDashboardView.vue'),
		meta: {
			title: 'Candidate Dashboard - Assessly',
		},
	},
	{
		path: '/candidate-dashboard/:id/details',
		name: 'CandidateAssessmentDetails',
		component: () => import('@/views/candidate-views/CandidateAssessmentDetailsView.vue'),
		meta: {
			title: 'Candidate Assessment Details - Assessly',
		},
		props: true,
	},
	{
		path: '/recruiter-dashboard',
		name: 'RecruiterDashboard',
		component: () => import('@/views/recruiter-views/RecruiterDashboardView.vue'),
		meta: {
			title: 'Recruiter Dashboard - Assessly',
		},
	},
	{
		path: '/recruiter-dashboard/create',
		name: 'CreateAssessment',
		component: () => import('@/views/recruiter-views/RecruiterCreateAssessment.vue'),
		meta: {
			title: 'Recruiter Create Assessment - Assessly',
		},
		props: true,
	},
	{
		path: '/recruiter-dashboard/:id/details',
		name: 'RecruiterAssessmentDetails',
		component: () => import('@/views/recruiter-views/RecruiterAssessmentDetailsView.vue'),
		meta: {
			title: 'Recruiter Assessment Details - Assessly',
		},
		props: true,
	},
	{
		path: '/candidate-dashboard/:id/details',
		name: 'CandidateAssessmentDetails',
		component: () => import('@/views/candidate-views/CandidateAssessmentDetailsView.vue'),
		meta: {
			title: 'Candidate Assessment Details - Assessly',
		},
		props: true,
	},
	{
		path: '/candidate-assessment/:id',
		name: 'CandidateAssessment',
		component: () => import('@/views/LiveAssistantView.vue'),
		props: true,
	},
	{
		path: '/manage-subscription',
		name: 'ManageSubscription',
		component: () => import('@/views/subscription-views/ManageSubscriptionView.vue'),
		meta: {
			title: 'Manage Subscription - Assessly',
		},
	},
	{
		path: '/purchase-subscription',
		name: 'PurchaseSubscription',
		component: () => import('@/views/subscription-views/PurchaseSubscriptionView.vue'),
		meta: {
			title: 'Purchase Subscription - Assessly',
		},
	},
	// Redirect from old paths
	{
		path: '/candidate-dashboard/:id/details',
		redirect: (to) => ({
			name: 'CandidateAssessmentDetails',
			params: { slug: to.params.id },
		}),
	},
	// Catch all 404
	{
		path: '/:pathMatch(.*)*',
		name: 'NotFound',
		component: () => import('@/views/NotFoundView.vue'),
		meta: {
			title: 'Page Not Found - Assessly',
		},
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
	scrollBehavior(to, from, savedPosition) {
		// Always scroll to top when navigating to a new page
		if (savedPosition) {
			return savedPosition;
		}
		return { top: 0 };
	},
});

// Navigation guards
router.beforeEach((to) => {
	// Update document title
	document.title = (to.meta.title as string) || 'Assessly';
});

export default router;
