from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    """Pagination مشترک برای همه‌ی اپ‌ها. طبق api-contract.md تغییرش ندید."""

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
