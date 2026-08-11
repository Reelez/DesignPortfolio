from rest_framework.routers import DefaultRouter

from apps.projects.views import CategoryViewSet, ProjectViewSet, TagViewSet

router = DefaultRouter()
router.register("projects", ProjectViewSet, basename="project")
router.register("categories", CategoryViewSet, basename="category")
router.register("tags", TagViewSet, basename="tag")

urlpatterns = router.urls
