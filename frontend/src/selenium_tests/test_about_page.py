import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class AboutPageTest(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Chrome()
        self.wait = WebDriverWait(self.driver, 5)
        self.base_url = "https://foodbankconnect.me"

    def test_headers(self):
        driver = self.driver
        wait = self.wait

        # go to home page
        driver.get(self.base_url)

        # click "About the Site" link
        about_link = wait.until(
            EC.element_to_be_clickable((By.LINK_TEXT, "About the Site"))
        )
        about_link.click()

        # wait until About page loads
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))

        # collect all headers
        headers = [h.text.strip() for h in driver.find_elements(By.TAG_NAME, "h1")] + \
                  [h.text.strip() for h in driver.find_elements(By.TAG_NAME, "h2")]

        expected_headers = [
            "About the Site",
            "Meet the Team",
            "Integrating Disparate Data",
            "Data Sources",
            "Tools Used",
            "Optional Tools Used",
            "Links",
        ]

        for header in expected_headers:
            self.assertIn(header, headers, f"Missing header: {header}")

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
