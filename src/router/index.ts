import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: 'Home - Assessly'
    }
  },
  {
    path: '/assessments',
    name: 'Assessments',
    component: () => import('@/views/AssessmentsView.vue'),
    meta: {
      title: 'Assessments - Assessly'
    }
  },
  {
    path: '/assessments/:slug',
    name: 'AssessmentDetail',
    component: () => import('@/views/AssessmentDetailView.vue'),
    meta: {
      title: 'Assessment - Assessly'
    },
    props: true
  },
  // Redirect from old paths
  {
    path: '/assessment/:slug',
    redirect: to => ({
      name: 'AssessmentDetail',
      params: { slug: to.params.slug }
    })
  },
  // Catch all 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: 'Page Not Found - Assessly'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top when navigating to a new page
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// Navigation guards
router.beforeEach((to) => {
  // Update document title
  document.title = to.meta.title as string || 'Assessly'
})

export default router 