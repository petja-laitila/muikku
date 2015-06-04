package fi.muikku.ui.chrome;

import org.junit.After;
import org.junit.Before;
import org.openqa.selenium.chrome.ChromeDriver;

import fi.muikku.ui.base.CourseMaterialsPageTestsBase;

public class CourseMaterialsPageTestsIT extends CourseMaterialsPageTestsBase {
  
  @Before
  public void setUp() {
    setWebDriver(new ChromeDriver());
  }
  
  @After
  public void tearDown() {
    getWebDriver().quit();
  }
  
}