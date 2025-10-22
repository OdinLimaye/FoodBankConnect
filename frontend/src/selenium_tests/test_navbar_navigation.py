import unittest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "https://foodbankconnect.me"  # ✅ your deployed site

class TestNavbarNavigation(unittest.TestCase):
    def setUp(self):
        options = Options()
        options.add_argument("--headless")  # run silently
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        self.driver = webdriver.Chrome(options=options)

    def tearDown(self):
        self.driver.quit()

    def test_navbar_navigation(self):
        driver = self.driver
        wait = WebDriverWait(driver, 10)

        # Open live homepage
        driver.get(BASE_URL)

        # Just test that each of the buttons works via HTTPS
        nav_links = [
            ("View Food Banks", "/foodbanks"),
            ("View Sponsors", "/sponsors"),
            ("View Programs", "/programs"),
        ]

        for link_text, expected_path in nav_links:
            # Wait for link, click, and assert URL
            link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, link_text)))
            link.click()

            wait.until(EC.url_contains(expected_path))
            current_url = driver.current_url
            assert expected_path in current_url, f"{link_text} did not navigate properly"

            # Go back to home page for next test
            driver.get(BASE_URL)

if __name__ == "__main__":
    unittest.main()
